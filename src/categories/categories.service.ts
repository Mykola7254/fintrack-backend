import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { QueryCategoriesDto } from './dto/query-categories.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category, CategoryType } from './entities/category.entity.js';

export type CategoryResponse = Category & { is_system: boolean };

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>,
    ) {}

    async findAll(
        userId: number,
        query: QueryCategoriesDto,
    ): Promise<CategoryResponse[]> {
        const qb = this.visibleTo(userId);

        if (query.type) {
            qb.andWhere('category.type = :type', { type: query.type });
        }

        if (query.search) {
            qb.andWhere('category.name LIKE :search', {
                search: `%${query.search}%`,
            });
        }

        const categories = await qb
            .orderBy('category.user_id IS NULL', 'DESC')
            .addOrderBy('category.id', 'ASC')
            .getMany();

        return categories.map((category) => this.toResponse(category));
    }

    async findOne(userId: number, id: number): Promise<CategoryResponse> {
        const category = await this.visibleTo(userId)
            .andWhere('category.id = :id', { id })
            .getOne();

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return this.toResponse(category);
    }

    async create(
        userId: number,
        createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryResponse> {
        await this.assertNameFree(
            userId,
            createCategoryDto.name,
            createCategoryDto.type,
        );

        const category = this.categoriesRepository.create({
            user_id: userId,
            name: createCategoryDto.name,
            type: createCategoryDto.type,
            icon_name: createCategoryDto.icon_name ?? null,
            color_code: createCategoryDto.color_code ?? null,
        });

        const saved = await this.categoriesRepository.save(category);

        return this.toResponse(saved);
    }

    async update(
        userId: number,
        id: number,
        updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryResponse> {
        const category = await this.findOwn(userId, id);

        if (
            updateCategoryDto.name !== undefined &&
            updateCategoryDto.name !== category.name
        ) {
            await this.assertNameFree(
                userId,
                updateCategoryDto.name,
                category.type,
            );
        }

        Object.assign(category, updateCategoryDto);

        const saved = await this.categoriesRepository.save(category);

        return this.toResponse(saved);
    }

    // У транзакціях category_id стане null (on delete set null)
    async remove(userId: number, id: number): Promise<void> {
        const category = await this.findOwn(userId, id);

        await this.categoriesRepository.remove(category);
    }

    private visibleTo(userId: number) {
        return this.categoriesRepository
            .createQueryBuilder('category')
            .where(
                new Brackets((qb) => {
                    qb.where('category.user_id IS NULL').orWhere(
                        'category.user_id = :userId',
                        { userId },
                    );
                }),
            );
    }

    private async findOwn(userId: number, id: number): Promise<Category> {
        const category = await this.findOne(userId, id);

        if (category.is_system) {
            throw new ForbiddenException('System categories cannot be changed');
        }

        return category;
    }

    private async assertNameFree(
        userId: number,
        name: string,
        type: CategoryType,
    ): Promise<void> {
        const taken = await this.visibleTo(userId)
            .andWhere('category.name = :name', { name })
            .andWhere('category.type = :type', { type })
            .getExists();

        if (taken) {
            throw new ConflictException('Category with this name already exists');
        }
    }

    private toResponse(category: Category): CategoryResponse {
        return Object.assign(category, {
            is_system: category.user_id === null,
        });
    }
}
