import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity.js';
import { AuthUser } from './current-user.decorator.js';

interface JwtPayload {
    sub: number;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    // Перевіряємо, що користувач з токена досі існує
    async validate(payload: JwtPayload): Promise<AuthUser> {
        const exists = await this.userRepository.exists({
            where: { id: payload.sub },
        });

        if (!exists) {
            throw new UnauthorizedException('User no longer exists');
        }

        return { id: payload.sub, email: payload.email };
    }
}
