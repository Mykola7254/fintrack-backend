import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module.js';
import { Account } from '../accounts/entities/account.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { User } from '../users/entities/user.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Transaction]),
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
