import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async findOne(id: number) {
        const user = await this.findUser(id);

        return this.toProfile(user);
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findUser(id);

        if (updateUserDto.full_name !== undefined) {
            user.full_name = updateUserDto.full_name;
        }

        if (
            updateUserDto.email !== undefined &&
            updateUserDto.email !== user.email
        ) {
            const emailTaken = await this.usersRepository.exists({
                where: { email: updateUserDto.email },
            });

            if (emailTaken) {
                throw new ConflictException(
                    'User with this email already exists',
                );
            }

            user.email = updateUserDto.email;
        }

        if (updateUserDto.phone !== undefined) {
            user.phone = updateUserDto.phone;
        }

        if (updateUserDto.default_currency !== undefined) {
            user.default_currency = updateUserDto.default_currency;
        }

        const updatedUser = await this.usersRepository.save(user);

        return this.toProfile(updatedUser);
    }

    async changePassword(
        id: number,
        changePasswordDto: ChangePasswordDto,
    ): Promise<void> {
        const user = await this.findUser(id);

        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.current_password,
            user.password_hash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        if (changePasswordDto.current_password === changePasswordDto.new_password) {
            throw new BadRequestException(
                'New password must differ from the current one',
            );
        }

        user.password_hash = await bcrypt.hash(
            changePasswordDto.new_password,
            10,
        );

        await this.usersRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        await this.findUser(id);

        await this.usersRepository.delete(id);
    }

    private async findUser(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    private toProfile(user: User) {
        return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            default_currency: user.default_currency,
            created_at: user.created_at,
        };
    }
}
