import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    app.enableCors();

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Документація API: http://localhost:3000/api/docs
    const swaggerConfig = new DocumentBuilder()
        .setTitle('FinTrack API')
        .setDescription('Backend API для мобільного застосунку FinTrack')
        .setVersion('1.0')
        .addBearerAuth()
        .addSecurityRequirements('bearer')
        .build();

    SwaggerModule.setup(
        'api/docs',
        app,
        SwaggerModule.createDocument(app, swaggerConfig),
    );

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);

    await app.listen(port);
}

await bootstrap();
