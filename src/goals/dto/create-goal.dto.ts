import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateGoalDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    target_amount: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    current_amount?: number;

    @IsOptional()
    @IsDateString({ strict: true })
    deadline?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon?: string;
}
