import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CoursesRepository } from './courses.repository';
import { Course } from './entities/course.entity';
import { LanguageService } from 'src/language/language.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { DeepPartial } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly languageService: LanguageService,
    private readonly uploadFileService: CloudinaryService,
  ) {}

  async getPagination(page, limit) {
    page = Number(page) ? Number(page) : 1;
    limit = Number(limit) ? Number(limit) : 5;
    const courses = await this.coursesRepository.getPagination(page, limit);
    if (!courses) throw new NotFoundException('Courses not found');
    return courses;
  }

  async rateCourse(courseId: string, userId: string, stars: number) {
    if (stars < 1 || stars > 5) {
      throw new BadRequestException('Las estrellas deben estar entre 1 y 5');
    }

    const course = await this.coursesRepository.findByIdWithRatings(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const userAlreadyRated = course.ratedByUsers.some(
      (user) => user.id === userId,
    );
    if (userAlreadyRated) {
      throw new BadRequestException('El usuario ya ha calificado este curso');
    }

    const updatedCourse = await this.coursesRepository.updateCourseRating(
      course,
      stars,
      userId,
    );

    return updatedCourse;
  }

  async create(
    data: CreateCourseDto,
    img_file?: Express.Multer.File[],
    video_file?: Express.Multer.File[],
  ) {
    const { language, title, ...othres } = data;
    const existCourse = await this.coursesRepository.findByTitle(title);
    if (existCourse) throw new BadRequestException('El curso ya existe');

    const existLanguage = await this.languageService.getByName(data.language);
    if (!existLanguage)
      throw new BadRequestException('No se encuentra el lenguaje seleccionado');

    const uploadFile = async (
      file?: Express.Multer.File,
    ): Promise<string | null> => {
      return file
        ? await this.uploadFileService.uploadFile(
            file.buffer,
            file.originalname,
          )
        : null;
    };
    const [image_url, video_url] = await Promise.all([
      uploadFile(img_file[0]),
      uploadFile(video_file[0]),
    ]);

    const newCurse: DeepPartial<Course> = {
      ...othres,
      title,
      language: existLanguage,
      img_url: image_url || undefined,
      video_url: video_url || undefined,
    };
    await this.coursesRepository.createCourse(newCurse);
    return newCurse;
  }

  async updateVideo(id: string, data) {
    const course = await this.coursesRepository.findById(id);
    if (!course) throw new BadRequestException('No se encuentra el curso');
    const video: DeepPartial<Course> = {
      video_url: await this.uploadFileService.uploadFile(data),
    };
    await this.coursesRepository.updateCourse(id, video);
  }

  async findAll(queries) {
    const { page, limit, ...filters } = queries;
    const skip = Number(page) ? Number(page) : 1;
    const take = Number(limit) ? Number(limit) : 5;
    const courses = await this.coursesRepository.getAllCourses(
      skip,
      take,
      filters,
    );
    if (!courses) throw new NotFoundException();
    return courses;
  }

  async findAllCourses() {
    return await this.coursesRepository.findAll();
  }

  async findOne(title: string) {
    return await this.coursesRepository.findByTitle(title);
  }

  async findById(id: string): Promise<Course> {
    return await this.coursesRepository.findById(id);
  }

  async update(
    id: string,
    data: UpdateCourseDto,
    files?: Express.Multer.File[],
  ) {
    const [img_file, video_file] = files;
    const course = await this.coursesRepository.findById(id);
    if (!course) throw new NotFoundException('No se encontro el curso');
    const uploadFile = async (
      file?: Express.Multer.File,
    ): Promise<string | null> => {
      return file
        ? await this.uploadFileService.uploadFile(
            file.buffer,
            file.originalname,
          )
        : null;
    };

    const [img_url, video_url] = await Promise.all([
      uploadFile(img_file),
      uploadFile(video_file),
    ]);

    if (img_url) {
      data.img_file = img_url;
    }

    if (video_url) {
      data.video_file = img_url;
    }
    await this.coursesRepository.updateCourse(id, data);
    return await this.coursesRepository.findById(id);
  }

  async remove(id: string) {
    const course = await this.coursesRepository.findById(id);
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!course.isActive)
      throw new BadRequestException('El curso ya se encuentra ianctivo');
    return await this.coursesRepository.remove(id);
  }
}
