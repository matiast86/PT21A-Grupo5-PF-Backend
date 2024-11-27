import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Course } from 'src/courses/entities/course.entity';
import { Role } from 'src/enums/roles.enum';
import { Membership } from 'src/membership/entities/membership.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { ReferralCode } from 'src/referral-codes/entities/referral-code.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
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
    description: 'Unique authentication identifier for the user.',
  })
  @IsString()
  @Column({ nullable: true })
  authId?: string;

  @ApiProperty({
    type: String,
    description: 'Name of the user.',
  })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({
    type: String,
    description: 'The email of the user.',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Personal identification number.',
  })
  @Column({ unique: true })
  idNumber: string;

  @ApiProperty({
    type: String,
    description: 'The password of the user.',
  })
  @Column()
  password: string;

  @ApiProperty({
    enum: Role,
    description: 'Enum indicating the user role.',
  })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @ApiProperty({
    type: String,
    description: 'URL for the user profile image.',
    default:
      'https://thumbs.dreamstime.com/b/vector-de-perfil-avatar-predeterminado-foto-usuario-medios-sociales-icono-183042379.jpg',
  })
  @Column({
    default:
      'https://thumbs.dreamstime.com/b/vector-de-perfil-avatar-predeterminado-foto-usuario-medios-sociales-icono-183042379.jpg',
  })
  photo: string;

  @ApiProperty({
    type: Boolean,
    description:
      'Indicates whether the user is included in newsletter messaging.',
    default: true,
  })
  @Column({ default: true })
  newsletter: boolean;

  @ApiProperty({
    type: Date,
    description: 'Timestamp indicating when the user was created.',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    type: Boolean,
    description: 'Indicates whether the user account is active.',
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({
    type: () => [Course],
    description: 'Courses assigned to teach.',
    required: false,
  })
  @ManyToMany(() => Course, (courses) => courses.teachers)
  coursesToTeach: Course[];

  @ApiProperty({
    type: () => [Course],
    description: 'Courses to take.',
    required: false,
  })
  @ManyToMany(() => Course, (courses) => courses.students)
  coursesToTake: Course[];

  @ApiProperty({
    type: () => Membership,
    description: 'Membership associated with the user.',
    required: false,
  })
  @OneToOne(() => Membership, (membership) => membership.user, {
    nullable: true,
  })
  @JoinColumn()
  membership: Membership;

  @ApiProperty({
    type: () => Subscription,
    description: 'Subscription associated with the user.',
    required: false,
  })
  @ApiProperty({
    type: () => [ReferralCode],
    description: 'Referral codes issued by the user.',
  })
  @OneToMany(() => ReferralCode, (referral) => referral.issuer)
  @JoinColumn()
  issuedReferralCodes: ReferralCode[];

  @ApiProperty({
    type: () => ReferralCode,
    description: 'Referral code redeemed by the user.',
    required: false,
  })
  @OneToOne(() => ReferralCode, (referral) => referral.redeemer, {
    nullable: true,
  })
  @JoinColumn()
  redeemedReferralCode?: ReferralCode;
}
