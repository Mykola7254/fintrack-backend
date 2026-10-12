import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { QueryCategoriesDto } from './dto/query-categories.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator.js';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    findAll(
        @CurrentUser() user: AuthUser,
        @Query() query: QueryCategoriesDto,
    ) {
        return this.categoriesService.findAll(user.id, query);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.categoriesService.findOne(user.id, id);
    }

    @Post()
    create(
        @CurrentUser() user: AuthUser,
        @Body() createCategoryDto: CreateCategoryDto,
    ) {
        return this.categoriesService.create(user.id, createCategoryDto);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(user.id, id, updateCategoryDto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.categoriesService.remove(user.id, id);
    }
}
