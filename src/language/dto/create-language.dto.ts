import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { DeepPartial } from "typeorm"

export class CreateLanguageDto{
@ApiProperty({
    name: 'name',
    description: 'language name',
    example: 'Guarani'
})
@IsNotEmpty()
@IsString()
name: string

@ApiProperty({
    name: 'A refence image of the language',
    description: 'in jpg or png, webp is more optimized or web, Max size 2MB'
})
@IsOptional()
image_url: string

@ApiProperty({
    name: 'courses',
    description: 'an array of courses names'
})
@IsOptional()
course: string[]

constructor(partial: DeepPartial<CreateLanguageDto>) {
    Object.assign(this, partial)
}
}