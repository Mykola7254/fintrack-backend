import {
    IsDateString,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';

export class CreateTransactionDto {
    @IsInt()
    account_id: number;

    @IsOptional()
    @IsInt()
    category_id?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
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