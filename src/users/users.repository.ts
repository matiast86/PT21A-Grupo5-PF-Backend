import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getUserByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async findNewsletterList(): Promise<Array<string>> {
    const users = await this.usersRepository.find({
      where: { newsletter: true },
      select: { email: true },
    });
    return users.map((user) => user.email);
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.usersRepository.update(user, updateUserDto);
    return await this.usersRepository.findOneBy({id})
  }

  async deleteUser(id: string) {
    const userToDelete = await this.findOne(id);
    if (!userToDelete) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.usersRepository.delete(userToDelete);
    return userToDelete.id;
  }
}
