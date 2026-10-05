import {
    IsDateString,
    IsIn,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateTransactionDto {
    @IsOptional()
    @IsInt()
    account_id?: number;

    @IsOptional()
    @IsInt()
    category_id?: number;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsIn(['income', 'expense'])
    type?: 'income' | 'expense';

    @IsOptional()
    @IsDateString()
    transaction_date?: string;

    @IsOptional()
    @IsString()
    comment?: string;
}