import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import {
    BudgetCategoryLimitDto,
    CreateBudgetDto,
} from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';
import { BudgetCategory } from './entities/budget-category.entity.js';
import { Budget } from './entities/budget.entity.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BudgetsService {
    constructor(
        @InjectRepository(Budget)
        private readonly budgetsRepository: Repository<Budget>,
        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
        private readonly categoriesService: CategoriesService,
        private readonly dataSource: DataSource,
    ) {}

    async create(userId: number, createBudgetDto: CreateBudgetDto) {
        this.assertPeriod(createBudgetDto.start_date, createBudgetDto.end_date);
        await this.assertCategories(userId, createBudgetDto.categories ?? []);

        const budget = this.budgetsRepository.create({
            user_id: userId,
            name: createBudgetDto.name,
            total_limit: createBudgetDto.total_limit.toFixed(2),
            start_date: createBudgetDto.start_date,
            end_date: createBudgetDto.end_date,
            categories: (createBudgetDto.categories ?? []).map((item) =>
                this.toBudgetCategory(item),
            ),
        });

        const saved = await this.budgetsRepository.save(budget);

        return this.findOne(userId, saved.id);
    }

    async findAll(userId: number) {
        const budgets = await this.findBudgets(userId);

        return Promise.all(
            budgets.map((budget) => this.withProgress(userId, budget)),
        );
    }

    async findCurrent(userId: number) {
        const today = this.formatDate(new Date());

        const [budget] = await this.findBudgets(userId, today);

        if (!budget) {
            throw new NotFoundException('No budget for the current period');
        }

        return this.withProgress(userId, budget);
    }

    async findOne(userId: number, id: number) {
        const budget = await this.findOwned(userId, id);

        return this.withProgress(userId, budget);
    }

    async update(userId: number, id: number, updateBudgetDto: UpdateBudgetDto) {
        const budget = await this.findOwned(userId, id);

        const startDate = updateBudgetDto.start_date ?? budget.start_date;
        const endDate = updateBudgetDto.end_date ?? budget.end_date;

        this.assertPeriod(startDate, endDate);

        if (updateBudgetDto.categories) {
            await this.assertCategories(userId, updateBudgetDto.categories);
        }

        await this.dataSource.transaction(async (manager) => {
            await manager.update(
                Budget,
                { id, user_id: userId },
                {
                    name: updateBudgetDto.name ?? budget.name,
                    total_limit:
                        updateBudgetDto.total_limit?.toFixed(2) ??
                        budget.total_limit,
                    start_date: startDate,
                    end_date: endDate,
                },
            );

            if (updateBudgetDto.categories) {
                await manager.delete(BudgetCategory, { budget_id: id });

                await manager.save(
                    updateBudgetDto.categories.map((item) =>
                        manager.create(BudgetCategory, {
                            ...this.toBudgetCategory(item),
                            budget_id: id,
                        }),
                    ),
                );
            }
        });

        return this.findOne(userId, id);
    }

    async remove(userId: number, id: number): Promise<void> {
        const budget = await this.findOwned(userId, id);

        await this.budgetsRepository.remove(budget);
    }

    private findBudgets(userId: number, activeOn?: string) {
        const qb = this.budgetsRepository
            .createQueryBuilder('budget')
            .leftJoinAndSelect('budget.categories', 'item')
            .leftJoin('item.category', 'category')
            .addSelect([
                'category.id',
                'category.name',
                'category.icon_name',
                'category.color_code',
            ])
            .where('budget.user_id = :userId', { userId });

        if (activeOn) {
            qb.andWhere('budget.start_date <= :activeOn', { activeOn })
                .andWhere('budget.end_date >= :activeOn', { activeOn });
        }

        return qb
            .orderBy('budget.start_date', 'DESC')
            .addOrderBy('budget.id', 'DESC')
            .addOrderBy('item.id', 'ASC')
            .getMany();
    }

    private async findOwned(userId: number, id: number): Promise<Budget> {
        const budget = await this.budgetsRepository
            .createQueryBuilder('budget')
            .leftJoinAndSelect('budget.categories', 'item')
            .leftJoin('item.category', 'category')
            .addSelect([
                'category.id',
                'category.name',
                'category.icon_name',
                'category.color_code',
            ])
            .where('budget.id = :id', { id })
            .andWhere('budget.user_id = :userId', { userId })
            .orderBy('item.id', 'ASC')
            .getOne();

        if (!budget) {
            throw new NotFoundException('Budget not found');
        }

        return budget;
    }

    // Витрачено = сума витрат за період; по категоріях — тільки витрати цієї категорії
    private async withProgress(userId: number, budget: Budget) {
        const rows = await this.transactionsRepository
            .createQueryBuilder('transaction')
            .select('transaction.category_id', 'category_id')
            .addSelect('SUM(transaction.amount)', 'spent')
            .where('transaction.user_id = :userId', { userId })
            .andWhere("transaction.type = 'expense'")
            .andWhere('transaction.transaction_date >= :from', {
                from: this.parseDate(budget.start_date),
            })
            .andWhere('transaction.transaction_date < :to', {
                to: this.parseDate(budget.end_date, 1),
            })
            .groupBy('transaction.category_id')
            .getRawMany<{ category_id: number | null; spent: string }>();

        const spentByCategory = new Map<number, number>();
        let totalSpent = 0;

        for (const row of rows) {
            const cents = this.toCents(row.spent);

            totalSpent += cents;

            if (row.category_id !== null) {
                spentByCategory.set(Number(row.category_id), cents);
            }
        }

        return {
            id: budget.id,
            name: budget.name,
            start_date: budget.start_date,
            end_date: budget.end_date,
            days_left: this.daysLeft(budget.end_date),
            ...this.progress(this.toCents(budget.total_limit), totalSpent),
            categories: budget.categories.map((item) => ({
                id: item.id,
                category: item.category,
                ...this.progress(
                    this.toCents(item.limit_amount),
                    spentByCategory.get(item.category_id) ?? 0,
                ),
            })),
        };
    }

    private progress(limitCents: number, spentCents: number) {
        return {
            limit_amount: this.fromCents(limitCents),
            spent: this.fromCents(spentCents),
            remaining: this.fromCents(Math.max(limitCents - spentCents, 0)),
            used_percent:
                limitCents > 0 ? Math.round((spentCents / limitCents) * 100) : 0,
            is_exceeded: spentCents > limitCents,
            exceeded_by: this.fromCents(Math.max(spentCents - limitCents, 0)),
        };
    }

    private async assertCategories(
        userId: number,
        items: BudgetCategoryLimitDto[],
    ): Promise<void> {
        for (const item of items) {
            const category = await this.categoriesService.findOne(
                userId,
                item.category_id,
            );

            if (category.type !== 'expense') {
                throw new BadRequestException(
                    `Category "${category.name}" is not an expense category`,
                );
            }
        }
    }

    private assertPeriod(startDate: string, endDate: string): void {
        if (endDate < startDate) {
            throw new BadRequestException(
                'end_date must be the same or after start_date',
            );
        }
    }

    private toBudgetCategory(item: BudgetCategoryLimitDto) {
        return {
            category_id: item.category_id,
            limit_amount: item.limit_amount.toFixed(2),
        } as BudgetCategory;
    }

    private daysLeft(endDate: string): number {
        const today = this.parseDate(this.formatDate(new Date()));
        const end = this.parseDate(endDate);

        return Math.max(Math.round((end.getTime() - today.getTime()) / DAY_MS), 0);
    }

    private parseDate(value: string, dayOffset = 0): Date {
        const [year, month, day] = value.split('-').map(Number);

        return new Date(year, month - 1, day + dayOffset);
    }

    private formatDate(date: Date): string {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${date.getFullYear()}-${month}-${day}`;
    }

    private toCents(value: string | number): number {
        return Math.round(Number(value) * 100);
    }

    private fromCents(cents: number): string {
        return (cents / 100).toFixed(2);
    }
}
