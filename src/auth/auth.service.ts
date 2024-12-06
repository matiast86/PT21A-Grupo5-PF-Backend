import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { SignupUserDto } from './dto/signup-auth.dto';
import { hash, compare } from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { UsersRepository } from 'src/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { EmailerService } from 'src/emailer/emailer.service';
import { SendEmailDto } from 'src/emailer/dto/send-email.dto';
import { emailHtml } from 'src/utils/email-template';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/enums/roles.enum';
import { Course } from 'src/courses/entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { AuthRepository } from './auth.repository';
import { AuthPayload } from 'src/helpers/AuthPayload';
import { verificationEmail } from 'src/helpers/VerifyEmail';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly userRepo: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailerService,
    private readonly authRepository: AuthRepository,
    private readonly fileService: CloudinaryService,
  ) {}

  async signUp(signUpUser: SignupUserDto, file?: Express.Multer.File) {
    if (signUpUser.password !== signUpUser.repeatPassword) {
      throw new HttpException('Las contraseñas no coinciden', 400);
    }

    if (file) {
      const photo_url = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
      );
      signUpUser.photo = photo_url;
    }

    signUpUser.password = await hash(signUpUser.password, 10);

    const newUser = await this.usersService.createUser(signUpUser);

    newUser.isVerified = false;
    await this.usersRepository.save(newUser);

    const verificationCode = randomBytes(4).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.authRepository.createVerificationCode(
      newUser.email,
      verificationCode,
      expiresAt,
    );

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  /* const verificationLink = () => {
   verificationEmail(
     newUser.email,
     verificationCode,
     baseUrl,
   );
   }*/
    
    const verificationLink = `https://rompiendo-barreras-pf.vercel.app/code-verification?email=${newUser.email}&code=${verificationCode}`;

    const message = emailHtml
      .replace('{{userName}}', signUpUser.name)
      .replace('{{verificationLink}}', verificationLink)
      .replace('{{code}}', verificationCode);

    const to = [signUpUser.email];
    const subject = 'Verifica tu cuenta en Uniendo Culturas';

    await this.emailService.sendWelcomeEmail({ to, subject, message });

    return newUser;
  }

  async verifyEmail(email: string, code: string) {
    const verification = await this.authRepository.findVerificationCode(
      email,
      code,
    );
    if (!verification) {
      throw new HttpException(
        'Código de verificación inválido.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (new Date() > verification.expiresAt) {
      throw new HttpException(
        'El código de verificación ha expirado.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.authRepository.activateUser(email);
    if(result) {
      await this.authRepository.deleteVerificationCode(verification.id);
      return { message: 'Cuenta verificada exitosamente.' };
    }
    return {message: 'Error inesperado en el checkeo'}
    }

  async signIn(credentials: SignInAuthDto) {
    const user = await this.userRepo.getUserByEmail(credentials.email);

    if (!user) {
      throw new HttpException('Usuario no encontrado', 404);
    }

    if (!user.isVerified) {
      throw new HttpException(
        'El usuario no ha verificado su correo.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordMatching = await compare(
      credentials.password,
      user.password,
    );

    if (!isPasswordMatching) {
      throw new HttpException(
        'Credenciales Incorrectas',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.isActive === false) {
      throw new HttpException(
        `Tu cuenta está inactiva. Por favor, contáctanos para más información a ${process.env.EMAIL_USERNAME}`,
        HttpStatus.FORBIDDEN,
      );
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      membership: user.membership,
    };

    const token = this.jwtService.sign(userPayload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        idNumber: user.idNumber,
        role: user.role,
        photo: user.photo,
        courses: this.findCourseType(user),
        ...(user.membership && { membership: user.membership }),
        ...(user.membership?.subscription && {
          subscription: user.membership.subscription,
        }),
      },
    };
  }

  generateJwt(user: any) {
    const payload: AuthPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      membership: user.membership,
    };
    return this.jwtService.sign(payload);
  }

  findCourseType(user: User): Course[] | undefined {
    switch (user.role) {
      case Role.USER:
        return user.coursesToTake;
        break;
      case Role.TEACHER:
        return user.coursesToTeach;
        break;
      default:
        return undefined;
    }
  }
}
