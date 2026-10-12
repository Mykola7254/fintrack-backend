import { Type } from 'class-transformer';
import {
    ArrayUnique,
    IsArray,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';

export class BudgetCategoryLimitDto {
    @IsInt()
    category_id: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    limit_amount: number;
}

export class CreateBudgetDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    total_limit: number;

    @IsDateString({ strict: true })
    start_date: string;

    @IsDateString({ strict: true })
    end_date: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique((item: BudgetCategoryLimitDto) => item.category_id)
    @ValidateNested({ each: true })
    @Type(() => BudgetCategoryLimitDto)
    categories?: BudgetCategoryLimitDto[];
}
