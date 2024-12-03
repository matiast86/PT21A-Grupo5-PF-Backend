import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLanguageDto } from './dto/create-language.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilePipe } from 'src/pipes/file/file.pipe';
import { FilterCourses } from 'src/helpers/Filter';
import { UpdateLanguageDto } from './dto/update-language.dto';

@ApiTags('Languages')
@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @ApiOperation({
    summary: 'Get all languages',
    description: "By default's values: page 1, limit 5",
  })
  @HttpCode(HttpStatus.OK)
  @Get('page')
  async getPagination(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.languageService.getPagination(page, limit);
  }

  @Get()
  async getAll() {
    return await this.languageService.getAll();
  }

  @Get(':path/courses')
  async getAndFilter(
    @Param('path') path: string,
    @Query() filters: FilterCourses,
  ) {
    return await this.languageService.getAndFilter(path, filters);
  }

  @ApiOperation({
    summary: 'Get a language courses',
  })
  @Get(':id/courses')
  async getById(id: string) {
    return await this.languageService.getCoursesFromLanguage(id);
  }

  @ApiOperation({ summary: 'Create language' })
  @Post('create')
  async createLanguage(@Body() createLanguageDto: CreateLanguageDto) {
    const {
      path,
      name,
      general_description,
      brief_description,
      img_url,
      flag_url,
      country_photo_url,
    } = createLanguageDto;
    return await this.languageService.addLanguage({
      path,
      name,
      general_description,
      brief_description,
      img_url,
      flag_url,
      country_photo_url,
    });
  }

  @Put(':id/flag_url')
  @ApiOperation({
    summary: 'Add a new language',
    description: 'This endpoint acepto send files with multipart',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async updateFlagg(
    @Param('id') id: string,
    @UploadedFile(
      new FilePipe(0, 2000, [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
      ]),
    )
    file: Express.Multer.File,
  ) {
    return await this.languageService.addFlag(id, file);
  }

  @ApiOperation({
    summary: 'Upload an image for the language',
    description: 'This endpoint accepts a file upload for the language image.',
  })
  @Put(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Param('id') id: string,
    @UploadedFile(
      new FilePipe(0, 2000, [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
      ]),
    )
    file?: Express.Multer.File | undefined,
  ) {
    return await this.languageService.addImage(id, file);
  }

  @ApiOperation({
    summary: 'Upload a country photo for the language',
    description: 'This endpoint accepts a file upload for the language country photo.',
  })
  @Put(':id/country_photo')
  @UseInterceptors(FileInterceptor('file'))
  async updateCountryPhoto(
    @Param('id') id: string,
    @UploadedFile(
      new FilePipe(0, 2000, [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
      ]),
    )
    file?: Express.Multer.File | undefined,
  ) {
    return await this.languageService.addCountryPhoto(id, file);
  }

  @ApiOperation({
    summary: 'Update language details',
  })
  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return await this.languageService.updateLanguage(id, updateLanguageDto);
  }

  @ApiOperation({
    summary: 'Delete a language',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLanguage(@Param('id') id: string) {
    return await this.languageService.delete(id);
  }
}
