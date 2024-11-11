import { ApiProperty } from '@nestjs/swagger';
import { Course } from 'src/courses/entities/course.entity';
import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { v4 as uuid } from 'uuid';

@Entity()
export class Lesson {
  @ApiProperty({
    name: 'id',
    description: 'Autogenered UUID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @ApiProperty({
    name: 'title',
    description: "Lesson's title",
    type: 'string',
    example: 'Clase 1: Introducción al guarani',
  })
  @Column()
  title: string;

  @ApiProperty({
    name: 'content',
    description: "Lesson's content",
    type: 'string',
    example:
      'El guarani es la segunda lengua de Paraguya y también es habalda en el noreste argentino...',
  })
  @Column()
  content: string;

  @ApiProperty({
    name: 'video',
    description:
      "Lesson's video. Only use for document this api. Validation by file-upload pipe and upload externaly",
  })
  @Column({
    default: 'https://www.youtube.com/embed/qxOkaU6RVz4?si=uNX_bov4i-FLzcOy',
  })
  video_url: string;

  @ApiProperty({
    name: 'course',
    description: 'lesson from course',
  })
  @ManyToOne(() => Course, (course) => course.lessons)
  @JoinColumn()
  course: Course;

  constructor(partial: DeepPartial<Lesson>) {
    Object.assign(this, partial);
  }
}
