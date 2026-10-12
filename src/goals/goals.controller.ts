import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateContributionDto } from './dto/create-contribution.dto.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalsService } from './goals.service.js';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator.js';

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) {}

    @Post()
    create(
        @CurrentUser() user: AuthUser,
        @Body() createGoalDto: CreateGoalDto,
    ) {
        return this.goalsService.create(user.id, createGoalDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.goalsService.findAll(user.id);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.goalsService.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateGoalDto: UpdateGoalDto,
    ) {
        return this.goalsService.update(user.id, id, updateGoalDto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.goalsService.remove(user.id, id);
    }

    @Get(':id/contributions')
    findContributions(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.goalsService.findContributions(user.id, id);
    }

    @Post(':id/contributions')
    addContribution(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() createContributionDto: CreateContributionDto,
    ) {
        return this.goalsService.addContribution(
            user.id,
            id,
            createContributionDto,
        );
    }
}
