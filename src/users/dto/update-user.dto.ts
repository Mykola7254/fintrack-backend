import {
    IsEmail,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    full_name?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    email?: string;

    @IsOptional()
    @Matches(/^\+?[0-9 ()-]{7,20}$/, { message: 'phone must be a valid phone number' })
    phone?: string;

    @IsOptional()
    @Matches(/^[A-Z]{3}$/, { message: 'default_currency must be a 3-letter code, e.g. UAH' })
    default_currency?: string;
}
