import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalContribution } from './entities/goal-contribution.entity.js';
import { Goal } from './entities/goal.entity.js';
import { GoalsController } from './goals.controller.js';
import { GoalsService } from './goals.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, GoalContribution])],
  controllers: [GoalsController],
  providers: [GoalsService],
})
export class GoalsModule {}
