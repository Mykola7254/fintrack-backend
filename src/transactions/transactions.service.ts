import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
    ) {}

    async create(
        userId: number,
        createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        const transaction = this.transactionsRepository.create({
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

        return this.transactionsRepository.save(transaction);
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
        const transaction = await this.findOne(userId, id);

        if (updateTransactionDto.account_id !== undefined) {
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

        await this.transactionsRepository.save(transaction);

        return this.findOne(userId, id);
    }

    async remove(userId: number, id: number): Promise<void> {
        const transaction = await this.findOne(userId, id);

        await this.transactionsRepository.remove(transaction);
    }
}
