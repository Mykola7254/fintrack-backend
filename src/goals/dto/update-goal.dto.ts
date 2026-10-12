import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

// Накопичена сума змінюється тільки через поповнення
export class UpdateGoalDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    target_amount?: number;

    @IsOptional()
    @IsDateString({ strict: true })
    deadline?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon?: string;
}
