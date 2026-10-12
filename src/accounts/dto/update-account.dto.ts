import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
} from 'class-validator';
import { ACCOUNT_TYPES, type AccountType } from '../entities/account.entity.js';

// Баланс напряму не змінюється — тільки через транзакції
export class UpdateAccountDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsString()
    @Length(3, 10)
    currency?: string;

    @IsOptional()
    @IsIn(ACCOUNT_TYPES)
    type?: AccountType;

    @IsOptional()
    @Matches(/^\d{4}$/, { message: 'card_last4 must be 4 digits' })
    card_last4?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    description?: string;
}
