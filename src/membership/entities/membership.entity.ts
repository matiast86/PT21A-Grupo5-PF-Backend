import { ApiProperty } from "@nestjs/swagger";
import { Payment } from "src/payments/entities/payment.entity";
import { Subscription } from "src/subscriptions/entities/subscription.entity";
import { User } from "src/users/entities/user.entity";
import { Column, DeepPartial, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity()
export class Membership {
    @ApiProperty({
        name: 'id',
        description: "autogenerated memebership's id"
    })
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid()

    @ApiProperty({
        name: 'user',
        description: "Membership's user"
    })
    @OneToOne(() => User, (user) => user.membership)
    user: User

    @ApiProperty({
        name: 'subscription',
        description: "associate membership plan"
    })
    @ManyToOne(() => Subscription, (subscription) => subscription.memberships, {eager: true})
    subscription: Subscription

    @ApiProperty({
        name: 'payments',
        description: "memebership's payment"
    })
    @OneToMany(() => Payment, (payment) => payment.membership, {cascade: true})
    payments: Payment[]

    @Column({nullable: true})
    external_id: string

    @ApiProperty({
        name: 'start_date',
        description: 'Membership initialization date'
    })
    @Column({default: new Date().toISOString()})
    start_date: string
    
    @ApiProperty({
        name: 'end_date',
        description: 'Membership finalization date, this field is autogenerated',
    })
    @Column({nullable: true})
    end_date: string

    @ApiProperty({
        name: 'subscription_modiefied_at',
        description: 'the date in this '
    })
    @Column({nullable: true})
    subscription_modified_at: string

    @ApiProperty({
        name: 'update_at',
        description: 'autogenerated colum'
    })
    @UpdateDateColumn()
    update_at: Date

    constructor(partial: DeepPartial<Membership>) {
        Object.assign(this, partial);
      }
}