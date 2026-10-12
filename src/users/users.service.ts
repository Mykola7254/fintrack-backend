import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async findOne(id: number) {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            created_at: user.created_at,
        };
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

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

        const updatedUser = await this.usersRepository.save(user);

        return {
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            created_at: updatedUser.created_at,
        };
    }

    async remove(id: number): Promise<void> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.usersRepository.delete(id);
    }
}