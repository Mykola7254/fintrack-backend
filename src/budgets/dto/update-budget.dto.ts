import { Type } from 'class-transformer';
import {
    ArrayUnique,
    IsArray,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { BudgetCategoryLimitDto } from './create-budget.dto.js';

// Якщо передано categories — список лімітів повністю замінюється
export class UpdateBudgetDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    total_limit?: number;

    @IsOptional()
    @IsDateString({ strict: true })
    start_date?: string;

    @IsOptional()
    @IsDateString({ strict: true })
    end_date?: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique((item: BudgetCategoryLimitDto) => item.category_id)
    @ValidateNested({ each: true })
    @Type(() => BudgetCategoryLimitDto)
    categories?: BudgetCategoryLimitDto[];
}
