import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    full_name?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    email?: string;
}