import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from 'src/language/entities/language.entity';
import { In, Repository } from 'typeorm';
import { languagesMock } from './languages-mock';

@Injectable()
export class LanguagesSeed {
  constructor(
    @InjectRepository(Language)
    private readonly languagesRepository: Repository<Language>,
  ) {}

  async seed() {
    try {
      const existingLanguage = await this.languagesRepository.find({
        where: { name: In(languagesMock) },
      });

      for (const languageName of languagesMock) {
        if (
          !existingLanguage.some(
            (language) => language.name === languageName.name,
          )
        ) {
          const language = new Language();
          language.name = languageName.name;
          language.image_url = languageName.image_url;
          language.flag_url = languageName.flag_url;
          language.country_photo_url = languageName.country_photo_url;
          language.description = languageName.description;
          await this.languagesRepository.save(language);
        }
      }
      console.log('Languages injection completed');
    } catch (error) {
      console.log(error);
    }
  }
}
