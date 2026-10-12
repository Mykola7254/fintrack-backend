import {
    IsDateString,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateContributionDto {
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    amount: number;

    // Якщо вказано — сума списується з цього рахунку
    @IsOptional()
    @IsInt()
    account_id?: number;

    @IsOptional()
    @IsDateString()
    contribution_date?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    comment?: string;
}
