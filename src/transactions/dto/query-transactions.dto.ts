import { Type } from 'class-transformer';
import {
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class QueryTransactionsDto {
    @IsOptional()
    @IsIn(['income', 'expense'])
    type?: 'income' | 'expense';

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    category_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    account_id?: number;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;
}
