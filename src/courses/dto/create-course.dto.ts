import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Lesson } from "src/lessons/entities/lesson.entity";
import { DeepPartial } from "typeorm";

export class CreateCourseDto {
    
    @ApiProperty({
        name: 'title',
        type: 'string',
        description: "Course's title"
    })
    @IsNotEmpty()
    @IsString()
    title: string
    
    @ApiProperty({
        name: 'video',
        description: "Course's video introduction, This field is only for documenting the api, uploading is managed by the upload-file pipe and hosted on an external service",
    })
    @IsOptional()
    video_url: Express.Multer.File
    
    @ApiProperty({
        name: 'lessons',
        description: "Course's lessons",
        nullable: true
    })
    @IsOptional()
    lessons: Lesson[]
    
    @ApiProperty({
        name: 'language',
        description: "course about language"
    })
    @IsNotEmpty()
    @IsString()
    language: string
    

    constructor(partial: DeepPartial<CreateCourseDto>) {
        Object.assign(this, partial)
      }
}
