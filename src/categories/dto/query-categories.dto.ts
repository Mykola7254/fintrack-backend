import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CategoryType } from '../entities/category.entity.js';

export class QueryCategoriesDto {
    @IsOptional()
    @IsIn(['income', 'expense'])
    type?: CategoryType;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    search?: string;
}
