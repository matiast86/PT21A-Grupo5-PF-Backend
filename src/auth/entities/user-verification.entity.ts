import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user-verifications')
export class UserVerification {
    @ApiProperty({
        description: 'Unique identifier for the verification record.'
      })
    @PrimaryGeneratedColumn()
    id: string;

    @ApiProperty({
        description: 'The email address associated with the verification.'
      })
    @Column()
    email: string;

    @ApiProperty({
        description: 'The verification code sent to the email.'
      })
    @Column()
    code: string;

    @ApiProperty({
        description: 'Expiration date and time for the verification code.'
      })
    @Column()
    expiresAt: Date;

    @ApiProperty({
        description: 'Timestamp of when the verification record was created.'
      })
    @CreateDateColumn()
    CreatedAt: Date;
}