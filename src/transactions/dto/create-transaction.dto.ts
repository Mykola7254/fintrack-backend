import {
    IsDateString,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateTransactionDto {
    @IsInt()
    user_id: number;

    @IsInt()
    account_id: number;

    @IsOptional()
    @IsInt()
    category_id?: number;

    @IsNumber()
    amount: number;

    @IsIn(['income', 'expense'])
    type: 'income' | 'expense';

    @IsOptional()
    @IsDateString()
    transaction_date?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    comment?: string;
}