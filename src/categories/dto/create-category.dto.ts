import {
    IsHexColor,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import type { CategoryType } from '../entities/category.entity.js';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @IsIn(['income', 'expense'])
    type: CategoryType;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon_name?: string;

    @IsOptional()
    @IsHexColor()
    color_code?: string;
}
