import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';
import { Account } from '../accounts/entities/account.entity.js';
import { Category } from '../categories/entities/category.entity.js';

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

    async findAll(userId: number): Promise<Transaction[]> {
        return this.transactionsRepository.find({
            where: { user_id: userId },
            order: { transaction_date: 'DESC' },
        });
    }

    async findOne(userId: number, id: number): Promise<Transaction> {
        const transaction = await this.transactionsRepository.findOne({
            where: { id, user_id: userId },
        });

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
