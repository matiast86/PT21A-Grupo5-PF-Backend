import { ApiProperty } from '@nestjs/swagger';
import { Course } from 'src/courses/entities/course.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity({ name: 'categories' })
export class Category {
  @ApiProperty({
    type: String,
    description: 'Autogenerated uuid.',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @ApiProperty({
    type: String,
    required: true,
    description: 'Provided name to create the category',
  })
  @Column()
  name: string;

  @ApiProperty({
    type: Array<Course>,
    description: 'FK related to the courses belonging to the category.',
  })
  @OneToMany(() => Course, (courses) => courses.category, { nullable: true })
  courses: Course[];
}
