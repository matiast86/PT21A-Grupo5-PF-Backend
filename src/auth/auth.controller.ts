import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signup-auth.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserResponseAuthDto } from './dto/user-response-auth.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FilePipe } from 'src/pipes/file/file.pipe';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('signup')
  @HttpCode(201)
  async signUp(
   /* @UploadedFile(
      new FilePipe(0, 20000, [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
      ]),
    )
    file: Express.Multer.File,*/
    @Body() signUpUser: SignupUserDto,
  ) {
    const newUser = await this.authService.signUp(signUpUser);
    return {
      message:
        'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.',
      user: new UserResponseAuthDto(newUser),
    };
  }

  @ApiOperation({ summary: 'Authenticate user and generate token' })
  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() credentials: SignInAuthDto) {
    return await this.authService.signIn(credentials);
  }

  @ApiOperation({summary: 'Verify email address with a code'})
  @Post('codeVerification')
  async verificationEmailWhitCode(
    @Query('email') email: string,
    @Query('code') code: string,
  ) {
    return await this.authService.verifyEmail(email, code);
  }

  @ApiOperation({ summary: 'Authenticate user and generate token' })
  @Get('login')
  @UseGuards(AuthGuard('auth0'))
  login() {
    return { message: 'Login exitoso' };
  }

  @ApiOperation({ summary: 'Handle Auth0 callback and issue JWT' })
  @Get('callback')
  @UseGuards(AuthGuard('auth0'))
  async callback(@Req() req, @Res() res) {
    const user = req.user;

    const token = await this.authService.generateJwt(user);

    const redirectUrl = `https://rompiendo-barreras-pf.vercel.app/auth/callback/?token=${encodeURIComponent(
      token,
    )}&user=${encodeURIComponent(JSON.stringify(user))}`;

    return res.redirect(redirectUrl);
  }

  @ApiOperation({
    summary: 'Log out the user and redirect to Auth0 logout URL',
  })
  @Get('logout')
  async logout(@Req() req, @Res() res): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        req.logout((err) => {
          if (err) {
            console.error('Error al cerrar sesión local:', err);
            return reject(
              new HttpException(
                'Error al cerrar sesión local',
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          }
          resolve();
        });
      });

      const logoutURL = `${process.env.AUTH0_DOMAIN}/v2/logout?returnTo=${encodeURIComponent(process.env.AUTH0_BASE_URL)}&client_id=${process.env.AUTH0_CLIENT_ID}`;

      res.redirect(logoutURL);
    } catch (error) {
      console.error('Error al cerrar sesión', error);
      res.status(error.status || 500).json({
        messaje: error.message || 'Error desconocido al cerrar sesión',
      });
    }
  }
}
