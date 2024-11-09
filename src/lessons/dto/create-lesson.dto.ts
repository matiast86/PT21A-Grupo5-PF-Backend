import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { DeepPartial } from "typeorm"

export class CreateLessonDto {
@ApiProperty({
    name: 'title',
    description: "Lesson's title",
    type: 'string',
    example: 'Clase 1: Introducción al guarani'
})
@IsString()
@IsNotEmpty()
title: string

@ApiProperty({
    name: 'content',
    description: "Lesson's content",
    type: 'string',
    example: 'El guarani es la segunda lengua de Paraguya y también es habalda en el noreste argentino...'
})
@IsString()
@IsNotEmpty()
content: string

@ApiProperty({
    name: 'video',
    description: "Lesson's video. Only use for document this api. Validation by file-upload pipe and upload externaly",
})
@IsOptional()
video: Express.Multer.File

@ApiProperty({
    name: 'course',
    description: 'From course',
    nullable: false,
    type: 'string'
})
@IsNotEmpty()
@IsString()
course: string

constructor(partial: DeepPartial<CreateLessonDto>) {
    Object.assign(this, partial)
  }
}