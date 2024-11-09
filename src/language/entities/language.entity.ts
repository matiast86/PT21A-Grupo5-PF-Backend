import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { defaultImage } from "./link.const";
import { Course } from "src/courses/entities/course.entity";

@Entity()
export class Language{

@ApiProperty({
    description: 'Autogeneretad UUID'
})
@PrimaryGeneratedColumn('uuid')
id: string = uuid()

@ApiProperty({
    description: 'the name of language',
    example: 'Guarani',
    maxLength: 50
})
@Column({type: 'varchar', length: 50, nullable: false })
name: string

@ApiProperty({
    name: 'image_url',
    description: 'A reference image of the language',
    type: 'string'
})
@Column({default: defaultImage})
image_url: string

@OneToMany(() => Course, course => course.language)
courses: Course[]
}
