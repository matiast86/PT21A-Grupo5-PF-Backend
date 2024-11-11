import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { LanguageRepository } from './language.repository';
import { Language } from './entities/language.entity';
import { CreateLanguageDto } from './dto/create-language.dto';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { DeepPartial } from 'typeorm';
import { isEqual } from 'src/helpers/is-equal';
import { Course } from 'src/courses/entities/course.entity';

@Injectable()
export class LanguageService {
  constructor(
    private readonly languageRepository: LanguageRepository,
    private readonly fileUploadService: CloudinaryService,
  ) {}

  async getAll(page, limit) {
    page = Number(page) ? Number(page) : 1;
    limit = Number(limit) ? Number(limit) : 5;
    const languages = await this.languageRepository.getAll(page, limit);
    if (!languages) throw new NotFoundException('Languages not found');
    return languages;
  }

  async getById(id: string): Promise<Language> {
    const language = await this.languageRepository.findById(id);
    if (!language) throw new NotFoundException('Language not found');
    return language;
  }

  async getCoursesFromLanguage(id: string): Promise<Course[]> {
    const language = await this.languageRepository.findById(id);
    if (!language) throw new NotFoundException('Language not found');
    return language.courses;
  }

  async getByName(name: string): Promise<Language> {
    const language = await this.languageRepository.findByName(name);
    if (!language) throw new NotFoundException('Language not found');
    return language;
  }

  async addLanguage(data: CreateLanguageDto): Promise<Language | null> {
    const language = await this.languageRepository.findByName(data.name);
    if (language) throw new BadRequestException('Este lenguaje ya  existe');
    const newLanguage = await this.languageRepository.create(data);
    return newLanguage;
  }

  async addFlag(id: string, file?) {
    const language = await this.languageRepository.findById(id);
    if (!language) throw new NotFoundException('Product not found');
    const newData: Partial<Language> = { image_url: '' };
    if (file) {
      let url = await this.fileUploadService.uploadFile(file);
      newData.flag_url = url;
    }
    const result = await this.languageRepository.update(id, newData);
    return { message: 'Successfully updated', result };
  }

  async addCountryPhoto(id: string, file?) {
    const language = await this.languageRepository.findById(id);
    if (!language) throw new NotFoundException('Product not found');
    const newData: Partial<Language> = { image_url: '' };
    if (file) {
      const url: string = await this.fileUploadService.uploadFile(file);
      newData.country_photo_url = url;
    }
    const result = await this.languageRepository.update(id, newData);
    return { message: 'Successfully updated', result };
  }

  async addImage(id: string, file?) {
    const language = await this.languageRepository.findById(id);
    if (!language) throw new NotFoundException('Product not found');
    const newData: Partial<Language> = { image_url: '' };
    if (file) {
      const url: string = await this.fileUploadService.uploadFile(file);
      newData.image_url = url;
    }
    const result = await this.languageRepository.update(id, newData);
    return { message: 'Successfully updated', result };
  }

  async delete(id: string) {
    const product = await this.languageRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return await this.languageRepository.delete(id);
  }
}
