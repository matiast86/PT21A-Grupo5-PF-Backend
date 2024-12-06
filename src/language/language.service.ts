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
import { Course } from 'src/courses/entities/course.entity';
import { FilterCourses } from 'src/helpers/Filter';
import { Level } from 'src/enums/level.enum';
import { Specialization } from 'src/enums/specializations.enum';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LanguageService {
  constructor(
    private readonly languageRepository: LanguageRepository,
    private readonly fileUploadService: CloudinaryService,
  ) {}

  async getPagination(page, limit) {
    page = Number(page) ? Number(page) : 1;
    limit = Number(limit) ? Number(limit) : 5;
    const languages = await this.languageRepository.getPagination(page, limit);
    if (!languages) throw new NotFoundException('Languages not found');
    return languages;
  }

  async getAndFilter(path: string, filter: FilterCourses) {
    if (filter.level && !Object.values(Level).includes(filter.level))
      throw new BadRequestException('El nivel buscado no existe');
    if (
      filter.specialization &&
      !Object.values(Specialization).includes(filter.specialization)
    )
      throw new BadRequestException('la especialización buscado no existe');
    const result = await this.languageRepository.getAndFilter(path, filter);
    if (!result) throw new NotFoundException('No se encontraron resultados');
    return result;
  }

  async getAll() {
    const languages = await this.languageRepository.getAll();
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

  async addLanguage(
    data: CreateLanguageDto,
    image_file?: Express.Multer.File,
    flag_file?: Express.Multer.File,
    country_file?: Express.Multer.File,
  ): Promise<Language | null> {
    const { path, name, general_description, brief_description } = data;

    const language = await this.languageRepository.findByName(name);
    if (language) throw new BadRequestException('Este lenguaje ya  existe');

    const uploadFile = async (
      file?: Express.Multer.File,
    ): Promise<string | null> => {
      return file
        ? await this.fileUploadService.uploadFile(
            file.buffer,
            file.originalname,
          )
        : null;
    };

    const [image_url, flag_url, country_photo_url] = await Promise.all([
      uploadFile(image_file),
      uploadFile(flag_file),
      uploadFile(country_file),
    ]);

    const newLanguage = new Language();
    newLanguage.path = path;
    newLanguage.name = name;
    newLanguage.general_description = general_description;
    newLanguage.brief_description = brief_description;
    newLanguage.image_url = image_url || undefined;
    newLanguage.flag_url = flag_url || undefined;
    newLanguage.country_photo_url = country_photo_url || undefined;
    await this.languageRepository.create(newLanguage);
    return newLanguage;
  }

  async addFlag(id: string, file?) {
    const language = await this.languageRepository.findById(id);

    if (!language) throw new NotFoundException('Product not found');
    const newData: Partial<Language> = { image_url: '' };

    if (file) {
      let url = await this.fileUploadService.uploadFile(file.buffer,file.originalname);
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
      const url: string = await this.fileUploadService.uploadFile(file.buffer, file.originalname);
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
      const url: string = await this.fileUploadService.uploadFile(file.buffer,file.originalname);
      console.log(url);

      newData.image_url = url;
    }
    const result = await this.languageRepository.update(id, newData);
    return { message: 'Successfully updated', result };
  }
s

  async updateLanguage(
    id: string,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<Language> {
    const languageToUpdate = await this.languageRepository.findById(id);
    if (!languageToUpdate) {
      throw new BadRequestException('Idioma inexistente.');
    }

    const updatedLanguage: Language = {
      ...languageToUpdate,
      ...updateLanguageDto,
    };

    await this.languageRepository.create(updatedLanguage);

    return updatedLanguage;
  }

  async delete(id: string) {
    const language = await this.languageRepository.findById(id);
    if (!language) throw new NotFoundException('Product not found');
    language.isActive = false;
    await this.languageRepository.create(language);
    return language;
  }
}
