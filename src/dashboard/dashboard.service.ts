import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service.js';
import { Account } from '../accounts/entities/account.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { User } from '../users/entities/user.entity.js';

const RECENT_TRANSACTIONS_LIMIT = 5;

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Account)
        private readonly accountsRepository: Repository<Account>,
        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
        private readonly accountsService: AccountsService,
        private readonly transactionsService: TransactionsService,
    ) {}

    async getSummary(userId: number) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1,
        );

        const [totals, month, accounts, recent] = await Promise.all([
            this.accountsRepository
                .createQueryBuilder('account')
                .select('COALESCE(SUM(account.balance), 0)', 'total_balance')
                .where('account.user_id = :userId', { userId })
                .getRawOne<{ total_balance: string }>(),
            this.transactionsRepository
                .createQueryBuilder('transaction')
                .select(
                    "COALESCE(SUM(CASE WHEN transaction.type = 'income' THEN transaction.amount ELSE 0 END), 0)",
                    'income',
                )
                .addSelect(
                    "COALESCE(SUM(CASE WHEN transaction.type = 'expense' THEN transaction.amount ELSE 0 END), 0)",
                    'expense',
                )
                .where('transaction.user_id = :userId', { userId })
                .andWhere('transaction.transaction_date >= :monthStart', {
                    monthStart,
                })
                .andWhere('transaction.transaction_date < :nextMonthStart', {
                    nextMonthStart,
                })
                .getRawOne<{ income: string; expense: string }>(),
            this.accountsService.findAll(userId),
            this.transactionsService.findAll(userId, {
                page: 1,
                limit: RECENT_TRANSACTIONS_LIMIT,
            }),
        ]);

        return {
            user: {
                id: user.id,
                full_name: user.full_name,
            },
            total_balance: Number(totals?.total_balance ?? 0).toFixed(2),
            month: {
                start: this.formatDate(monthStart),
                end: this.formatDate(
                    new Date(nextMonthStart.getTime() - 24 * 60 * 60 * 1000),
                ),
                income: Number(month?.income ?? 0).toFixed(2),
                expense: Number(month?.expense ?? 0).toFixed(2),
            },
            accounts_count: accounts.length,
            accounts,
            recent_transactions: recent.data,
        };
    }

    private formatDate(date: Date): string {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${date.getFullYear()}-${month}-${day}`;
    }
}
