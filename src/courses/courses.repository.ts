import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository, UpdateResult } from 'typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getPagination(page, limit) {
    return await this.coursesRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        lessons: true,
        teachers: true,
        language: true,
        students: true,
        category:true
      },
      order: { title: 'ASC' },
    });
  }

  async findByIdWithRatings(courseId: string) {
    return this.coursesRepository.findOne({
      where: { id: courseId },
      relations: { ratedByUsers: true, students: true, teachers: true },
    });
  }

  async updateCourseRating(course: Course, stars: number, userId: string) {
    const user = await this.usersRepository.findOne(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    course.totalStars += stars;
    course.totalRatings += 1;
    course.averageRating = course.totalStars / course.totalRatings;

    course.ratedByUsers.push(user);

    return await this.coursesRepository.save(course);
  }

  async getAllCourses(
    page: number,
    limit: number,
    filters: Record<string, any>,
  ): Promise<{
    data: Course[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const queryBuilder = this.coursesRepository.createQueryBuilder('course');
    queryBuilder
      .leftJoinAndSelect('course.ratedByUsers', 'users')
      .leftJoinAndSelect('course.teachers', 'teachers')
      .leftJoinAndSelect('course.lessons', 'lessons')
      .leftJoinAndSelect('course.language', 'language')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.students', 'students');

      queryBuilder.andWhere('course.isActive = :isActive', { isActive: true })

    Object.keys(filters).forEach((key) => {
      if (key === 'language') {
        queryBuilder.andWhere(`language.path = :language`, {
          language: filters[key],
        });
      } else if (key === 'category') {
        queryBuilder.andWhere(`category.name = :category`, {
          category: filters[key],
        });
      } else {
        queryBuilder.andWhere(`course.${key} = :${key}`, {
          [key]: filters[key],
        });
      }
    });

    queryBuilder
      .orderBy('course.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async findAll() {
    return await this.coursesRepository.find({
      relations: {
        lessons: true,
        teachers: true,
        language: true,
        students: true,
      },
    });
  }

  async findByTitle(title: string): Promise<Course | null> {
    return await this.coursesRepository.findOne({
      where: { title },
      relations: {
        lessons: true,
        teachers: true,
        language: true,
        students: true,
      },
    });
  }

  async findById(id: string): Promise<Course> {
    const result = await this.coursesRepository.findOne({
      where: { id },
      relations: {
        teachers: true,
        lessons: true,
        language: true,
        students: true,
        category:true
      },
    });
    if (!result) throw new NotFoundException('Curso no encontrado');
    return result;
  }

  async createCourse(data): Promise<Course[]> {
    return await this.coursesRepository.save(
      this.coursesRepository.create(data),
    );
  }

  async updateCourse(id, data): Promise<UpdateResult> {
    return await this.coursesRepository.update(id, data);
  }

  async remove(id) {
    const result = await this.coursesRepository.update(id, {isActive: false})
    if(result.affected === 0) throw new BadRequestException('Hubo un problema al inhabilitar el curso')
    return {
      course: id,
      isActive: false
    }
  }
}
