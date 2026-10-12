import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { QueryTransactionsDto } from './dto/query-transactions.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';
import { Account } from '../accounts/entities/account.entity.js';
import { Category } from '../categories/entities/category.entity.js';

export interface PaginatedTransactions {
    data: Transaction[];
    meta: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
        private readonly dataSource: DataSource,
    ) {}

    async create(
        userId: number,
        createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        const id = await this.dataSource.transaction(async (manager) => {
            await this.assertAccountOwned(
                manager,
                userId,
                createTransactionDto.account_id,
            );

            await this.assertCategoryUsable(
                manager,
                userId,
                createTransactionDto.category_id,
                createTransactionDto.type,
            );

            const transaction = manager.create(Transaction, {
                user_id: userId,
                account_id: createTransactionDto.account_id,
                category_id: createTransactionDto.category_id,
                amount: createTransactionDto.amount.toString(),
                type: createTransactionDto.type,
                transaction_date: createTransactionDto.transaction_date
                    ? new Date(createTransactionDto.transaction_date)
                    : new Date(),
                comment: createTransactionDto.comment,
            });

            const saved = await manager.save(transaction);

            await this.applyToBalance(manager, saved, 1);

            return saved.id;
        });

        return this.findOne(userId, id);
    }

    async findAll(
        userId: number,
        query: QueryTransactionsDto,
    ): Promise<PaginatedTransactions> {
        const qb = this.withRelations(userId);

        if (query.type) {
            qb.andWhere('transaction.type = :type', { type: query.type });
        }

        if (query.category_id) {
            qb.andWhere('transaction.category_id = :categoryId', {
                categoryId: query.category_id,
            });
        }

        if (query.account_id) {
            qb.andWhere('transaction.account_id = :accountId', {
                accountId: query.account_id,
            });
        }

        if (query.from) {
            qb.andWhere('transaction.transaction_date >= :from', {
                from: this.parseDate(query.from),
            });
        }

        if (query.to) {
            qb.andWhere('transaction.transaction_date < :to', {
                to: this.parseDate(query.to, 1),
            });
        }

        if (query.search) {
            qb.andWhere(
                '(transaction.comment LIKE :search OR category.name LIKE :search)',
                { search: `%${query.search}%` },
            );
        }

        const [data, total] = await qb
            .orderBy('transaction.transaction_date', 'DESC')
            .addOrderBy('transaction.id', 'DESC')
            .skip((query.page - 1) * query.limit)
            .take(query.limit)
            .getManyAndCount();

        return {
            data,
            meta: {
                total,
                page: query.page,
                limit: query.limit,
                total_pages: Math.ceil(total / query.limit),
            },
        };
    }

    async findOne(userId: number, id: number): Promise<Transaction> {
        const transaction = await this.withRelations(userId)
            .andWhere('transaction.id = :id', { id })
            .getOne();

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        return transaction;
    }

    async update(
        userId: number,
        id: number,
        updateTransactionDto: UpdateTransactionDto,
    ): Promise<Transaction> {
        await this.dataSource.transaction(async (manager) => {
            const transaction = await this.findOwned(manager, userId, id);

            // Відкочуємо старий вплив на баланс, потім застосовуємо новий
            await this.applyToBalance(manager, transaction, -1);

            if (updateTransactionDto.account_id !== undefined) {
                await this.assertAccountOwned(
                    manager,
                    userId,
                    updateTransactionDto.account_id,
                );
                transaction.account_id = updateTransactionDto.account_id;
            }

            if (updateTransactionDto.category_id !== undefined) {
                transaction.category_id = updateTransactionDto.category_id;
            }

            if (updateTransactionDto.amount !== undefined) {
                transaction.amount = updateTransactionDto.amount.toString();
            }

            if (updateTransactionDto.type !== undefined) {
                transaction.type = updateTransactionDto.type;
            }

            if (updateTransactionDto.transaction_date !== undefined) {
                transaction.transaction_date = new Date(
                    updateTransactionDto.transaction_date,
                );
            }

            if (updateTransactionDto.comment !== undefined) {
                transaction.comment = updateTransactionDto.comment;
            }

            await this.assertCategoryUsable(
                manager,
                userId,
                transaction.category_id,
                transaction.type,
            );

            await manager.save(transaction);

            await this.applyToBalance(manager, transaction, 1);
        });

        return this.findOne(userId, id);
    }

    async remove(userId: number, id: number): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const transaction = await this.findOwned(manager, userId, id);

            await this.applyToBalance(manager, transaction, -1);

            await manager.remove(transaction);
        });
    }

    private withRelations(userId: number) {
        return this.transactionsRepository
            .createQueryBuilder('transaction')
            .leftJoin('transaction.category', 'category')
            .addSelect([
                'category.id',
                'category.name',
                'category.type',
                'category.icon_name',
                'category.color_code',
            ])
            .leftJoin('transaction.account', 'account')
            .addSelect(['account.id', 'account.name', 'account.type'])
            .where('transaction.user_id = :userId', { userId });
    }

    // Дата без часу ("2026-09-30") — це локальна північ; для `to` включає весь день
    private parseDate(value: string, dayOffset = 0): Date {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

        if (!match) {
            return new Date(value);
        }

        return new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3]) + dayOffset,
        );
    }

    private async findOwned(
        manager: EntityManager,
        userId: number,
        id: number,
    ): Promise<Transaction> {
        const transaction = await manager.findOne(Transaction, {
            where: { id, user_id: userId },
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        return transaction;
    }

    private async assertAccountOwned(
        manager: EntityManager,
        userId: number,
        accountId: number,
    ): Promise<void> {
        const exists = await manager.exists(Account, {
            where: { id: accountId, user_id: userId },
        });

        if (!exists) {
            throw new NotFoundException('Account not found');
        }
    }

    private async assertCategoryUsable(
        manager: EntityManager,
        userId: number,
        categoryId: number | null | undefined,
        type: 'income' | 'expense',
    ): Promise<void> {
        if (categoryId === null || categoryId === undefined) {
            return;
        }

        const category = await manager
            .createQueryBuilder(Category, 'category')
            .where('category.id = :categoryId', { categoryId })
            .andWhere(
                '(category.user_id IS NULL OR category.user_id = :userId)',
                { userId },
            )
            .getOne();

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (category.type !== type) {
            throw new BadRequestException(
                `Category type "${category.type}" does not match transaction type "${type}"`,
            );
        }
    }

    // sign = 1 застосовує транзакцію до балансу, sign = -1 відкочує
    private async applyToBalance(
        manager: EntityManager,
        transaction: Transaction,
        sign: 1 | -1,
    ): Promise<void> {
        const direction = transaction.type === 'income' ? 1 : -1;
        const delta = (Number(transaction.amount) * direction * sign).toFixed(2);

        await manager.increment(
            Account,
            { id: transaction.account_id, user_id: transaction.user_id },
            'balance',
            delta,
        );
    }
}
