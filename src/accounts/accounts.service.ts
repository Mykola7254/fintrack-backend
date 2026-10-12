import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { Account } from './entities/account.entity.js';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private readonly accountsRepository: Repository<Account>,
    ) {}

    async create(
        userId: number,
        createAccountDto: CreateAccountDto,
    ): Promise<Account> {
        const account = this.accountsRepository.create({
            user_id: userId,
            name: createAccountDto.name,
            balance: (createAccountDto.balance ?? 0).toFixed(2),
            currency: createAccountDto.currency ?? 'UAH',
            type: createAccountDto.type ?? 'card',
            card_last4: createAccountDto.card_last4 ?? null,
            description: createAccountDto.description ?? null,
        });

        const saved = await this.accountsRepository.save(account);

        return this.findOne(userId, saved.id);
    }

    findAll(userId: number): Promise<Account[]> {
        return this.accountsRepository.find({
            where: { user_id: userId },
            order: { id: 'ASC' },
        });
    }

    async findOne(userId: number, id: number): Promise<Account> {
        const account = await this.accountsRepository.findOne({
            where: { id, user_id: userId },
        });

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        return account;
    }

    async update(
        userId: number,
        id: number,
        updateAccountDto: UpdateAccountDto,
    ): Promise<Account> {
        const account = await this.findOne(userId, id);

        Object.assign(account, updateAccountDto);

        await this.accountsRepository.save(account);

        return this.findOne(userId, id);
    }

    // Транзакції рахунку видаляються каскадно на рівні БД
    async remove(userId: number, id: number): Promise<void> {
        const account = await this.findOne(userId, id);

        await this.accountsRepository.remove(account);
    }
}
