import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        const { full_name, email, password } = registerDto;

        // Перевіряємо, чи вже існує користувач з таким email
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Хешуємо пароль
        const password_hash = await bcrypt.hash(password, 10);

        // Створюємо користувача
        const user = this.userRepository.create({
            full_name,
            email,
            password_hash,
        });

        // Записуємо в MySQL
        const savedUser = await this.userRepository.save(user);

        return {
            id: savedUser.id,
            full_name: savedUser.full_name,
            email: savedUser.email,
            created_at: savedUser.created_at,
        };
    }
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Шукаємо користувача за email
        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Перевіряємо пароль
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Створюємо JWT
        const payload = {
            sub: user.id,
            email: user.email,
        };

        const access_token = await this.jwtService.signAsync(payload);

        return {
            access_token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
            },
        };
    }

    async me(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            created_at: user.created_at,
        };
    }
}