import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CoursesRepository } from './courses.repository';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async create(data: CreateCourseDto, file) {
    const existCourse = await this.coursesRepository.findByTitle(data.title)
    if(existCourse) throw new BadRequestException('The course already exist') 
    return await this.coursesRepository.createCourse(data)
  }

  async findAll() {
    const courses = await this.coursesRepository.getAllCourses()
    if(!courses) throw new NotFoundException()
      return courses
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
