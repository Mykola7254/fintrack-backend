import { Injectable } from '@nestjs/common';
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
        createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        const transaction = this.transactionsRepository.create({
            user_id: createTransactionDto.user_id,
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

    async findAll(userId?: number): Promise<Transaction[]> {
        if (userId) {
            return this.transactionsRepository.find({
                where: { user_id: userId },
                order: { transaction_date: 'DESC' },
            });
        }

        return this.transactionsRepository.find({
            order: { transaction_date: 'DESC' },
        });
    }
    async update(
        id: number,
        updateTransactionDto: UpdateTransactionDto,
    ): Promise<Transaction> {
        const updateData = {
            account_id: updateTransactionDto.account_id,
            category_id: updateTransactionDto.category_id,
            amount: updateTransactionDto.amount !== undefined
                ? updateTransactionDto.amount.toString()
                : undefined,
            type: updateTransactionDto.type,
            transaction_date: updateTransactionDto.transaction_date
                ? new Date(updateTransactionDto.transaction_date)
                : undefined,
            comment: updateTransactionDto.comment,
        };

        await this.transactionsRepository.update(id, updateData);

        return this.transactionsRepository.findOneByOrFail({ id });
    }

    async remove(id: number): Promise<void> {
        await this.transactionsRepository.delete(id);
    }
}