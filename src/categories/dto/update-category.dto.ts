import {
    IsHexColor,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

// Тип категорії не змінюється, бо від нього залежать транзакції
export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon_name?: string;

    @IsOptional()
    @IsHexColor()
    color_code?: string;
}
