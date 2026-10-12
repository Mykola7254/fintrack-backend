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
import { BudgetsService } from './budgets.service.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator.js';

@ApiTags('Budgets')
@Controller('budgets')
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) {}

    @Post()
    create(
        @CurrentUser() user: AuthUser,
        @Body() createBudgetDto: CreateBudgetDto,
    ) {
        return this.budgetsService.create(user.id, createBudgetDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.budgetsService.findAll(user.id);
    }

    @Get('current')
    findCurrent(@CurrentUser() user: AuthUser) {
        return this.budgetsService.findCurrent(user.id);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.budgetsService.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBudgetDto: UpdateBudgetDto,
    ) {
        return this.budgetsService.update(user.id, id, updateBudgetDto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.budgetsService.remove(user.id, id);
    }
}
