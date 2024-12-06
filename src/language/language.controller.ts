import {
  BadRequestException,
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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLanguageDto } from './dto/create-language.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilePipe } from 'src/pipes/file/file.pipe';
import { FilterCourses } from 'src/helpers/Filter';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { Role } from 'src/enums/roles.enum';

@ApiBearerAuth()
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
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard,RolesGuard)
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/jpg',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: { fileSize: 200000 },
    }),
  )
  @Post()
  async createLanguage(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createLanguageDto: CreateLanguageDto,
  ) {
    const [image_file, flag_file, country_file] = files || [];
    const { path, name, general_description, brief_description } =
      createLanguageDto;
    return await this.languageService.addLanguage(
      {
        path,
        name,
        general_description,
        brief_description,
      },
      image_file,
      flag_file,
      country_file,
    );
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(AuthGuard,RolesGuard)
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
      new FilePipe(0, 200000, [
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
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(AuthGuard,RolesGuard)
  @Put(':id/image')
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
  async updateImage(
    @Param('id') id: string,
    @UploadedFile(
      new FilePipe(0, 20000000, [
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
    description:
      'This endpoint accepts a file upload for the language country photo.',
  })
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(AuthGuard,RolesGuard)
  @Put(':id/country_photo')
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
  async updateCountryPhoto(
    @Param('id') id: string,
    @UploadedFile(
      new FilePipe(0, 200000, [
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
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(AuthGuard,RolesGuard)
  @Put('update/:id')
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return await this.languageService.updateLanguage(id, updateLanguageDto);
  }

  @ApiOperation({
    summary: 'Delete a language',
  })
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard,RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLanguage(@Param('id') id: string) {
    return await this.languageService.delete(id);
  }
}
