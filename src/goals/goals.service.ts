import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../accounts/entities/account.entity.js';
import { CreateContributionDto } from './dto/create-contribution.dto.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalContribution } from './entities/goal-contribution.entity.js';
import { Goal } from './entities/goal.entity.js';

@Injectable()
export class GoalsService {
    constructor(
        @InjectRepository(Goal)
        private readonly goalsRepository: Repository<Goal>,
        @InjectRepository(GoalContribution)
        private readonly contributionsRepository: Repository<GoalContribution>,
        private readonly dataSource: DataSource,
    ) {}

    async create(userId: number, createGoalDto: CreateGoalDto) {
        const goal = this.goalsRepository.create({
            user_id: userId,
            title: createGoalDto.title,
            target_amount: createGoalDto.target_amount.toFixed(2),
            current_amount: (createGoalDto.current_amount ?? 0).toFixed(2),
            deadline: createGoalDto.deadline ?? null,
            icon: createGoalDto.icon ?? null,
        });

        const saved = await this.goalsRepository.save(goal);

        return this.findOne(userId, saved.id);
    }

    async findAll(userId: number) {
        const goals = await this.goalsRepository.find({
            where: { user_id: userId },
            order: { id: 'ASC' },
        });

        return goals.map((goal) => this.withProgress(goal));
    }

    async findOne(userId: number, id: number) {
        const goal = await this.findOwned(userId, id);

        return this.withProgress(goal);
    }

    async update(userId: number, id: number, updateGoalDto: UpdateGoalDto) {
        const goal = await this.findOwned(userId, id);

        if (updateGoalDto.title !== undefined) {
            goal.title = updateGoalDto.title;
        }

        if (updateGoalDto.target_amount !== undefined) {
            goal.target_amount = updateGoalDto.target_amount.toFixed(2);
        }

        if (updateGoalDto.deadline !== undefined) {
            goal.deadline = updateGoalDto.deadline;
        }

        if (updateGoalDto.icon !== undefined) {
            goal.icon = updateGoalDto.icon;
        }

        await this.goalsRepository.save(goal);

        return this.findOne(userId, id);
    }

    async remove(userId: number, id: number): Promise<void> {
        const goal = await this.findOwned(userId, id);

        await this.goalsRepository.remove(goal);
    }

    async findContributions(userId: number, goalId: number) {
        await this.findOwned(userId, goalId);

        return this.contributionsRepository
            .createQueryBuilder('contribution')
            .leftJoin('contribution.account', 'account')
            .addSelect(['account.id', 'account.name'])
            .where('contribution.goal_id = :goalId', { goalId })
            .orderBy('contribution.contribution_date', 'DESC')
            .addOrderBy('contribution.id', 'DESC')
            .getMany();
    }

    // Поповнення збільшує накопичене і, якщо вказано рахунок, зменшує його баланс
    async addContribution(
        userId: number,
        goalId: number,
        createContributionDto: CreateContributionDto,
    ) {
        const amount = createContributionDto.amount.toFixed(2);

        await this.dataSource.transaction(async (manager) => {
            const goal = await manager.findOne(Goal, {
                where: { id: goalId, user_id: userId },
            });

            if (!goal) {
                throw new NotFoundException('Goal not found');
            }

            const accountId = createContributionDto.account_id ?? null;

            if (accountId !== null) {
                const result = await manager.decrement(
                    Account,
                    { id: accountId, user_id: userId },
                    'balance',
                    amount,
                );

                if (!result.affected) {
                    throw new NotFoundException('Account not found');
                }
            }

            await manager.increment(
                Goal,
                { id: goalId },
                'current_amount',
                amount,
            );

            await manager.save(
                manager.create(GoalContribution, {
                    goal_id: goalId,
                    account_id: accountId,
                    amount,
                    contribution_date: createContributionDto.contribution_date
                        ? new Date(createContributionDto.contribution_date)
                        : new Date(),
                    comment: createContributionDto.comment ?? null,
                }),
            );
        });

        return this.findOne(userId, goalId);
    }

    private async findOwned(userId: number, id: number): Promise<Goal> {
        const goal = await this.goalsRepository.findOne({
            where: { id, user_id: userId },
        });

        if (!goal) {
            throw new NotFoundException('Goal not found');
        }

        return goal;
    }

    private withProgress(goal: Goal) {
        const target = Math.round(Number(goal.target_amount) * 100);
        const current = Math.round(Number(goal.current_amount) * 100);

        return {
            ...goal,
            remaining: (Math.max(target - current, 0) / 100).toFixed(2),
            progress_percent:
                target > 0
                    ? Math.min(Math.round((current / target) * 100), 100)
                    : 0,
            is_achieved: current >= target,
        };
    }
}
