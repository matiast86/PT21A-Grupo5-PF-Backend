import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    type: String,
    description: 'The name of the category to be created.',
    example: 'Premium',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

