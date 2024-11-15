import { ApiProperty } from '@nestjs/swagger';
import { Course } from 'src/courses/entities/course.entity';
import { Role } from 'src/enums/roles.enum';
import { Membership } from 'src/membership/entities/membership.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    type: String,
    description: 'Autogenerated uuid.',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @ApiProperty({
    type: String,
    required: true,
    description: 'Name of the user',
  })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'The email of the user',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Personal identification number',
  })
  @Column({ unique: true })
  idNumber: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'The password of the user',
  })
  @Column()
  password: string;

  @ApiProperty({
    default: 'User',
    description:
      'Enum indicating if the user is either a simple user, teacher or an admin. ',
  })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @ApiProperty({
    default:
      'https://thumbs.dreamstime.com/b/vector-de-perfil-avatar-predeterminado-foto-usuario-medios-sociales-icono-183042379.jpg',
    description: 'User profile image',
  })
  @Column({
    default:
      'https://thumbs.dreamstime.com/b/vector-de-perfil-avatar-predeterminado-foto-usuario-medios-sociales-icono-183042379.jpg',
  })
  photo: string;

  @ApiProperty({
    default: true,
    description:
      'It indicates weather the user should be included in the newsletter messaging or not.',
  })
  @Column({ default: true })
  newsletter: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToMany(() => Course, (courses) => courses.users)
  courses?: Course[];

  @ManyToOne(() => Membership, (membership) => membership.user, {
    nullable: true,
  })
  membership: Membership;

  @ManyToOne(() => Subscription, (membership) => membership.users, {
    nullable: true,
  })
  subscription: Subscription;

}
