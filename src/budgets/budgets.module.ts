import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { BudgetsController } from './budgets.controller.js';
import { BudgetsService } from './budgets.service.js';
import { BudgetCategory } from './entities/budget-category.entity.js';
import { Budget } from './entities/budget.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, BudgetCategory, Transaction]),
    CategoriesModule,
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
