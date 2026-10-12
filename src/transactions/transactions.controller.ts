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
    Query,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { QueryTransactionsDto } from './dto/query-transactions.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { TransactionsService } from './transactions.service.js';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator.js';

@Controller('transactions')
export class TransactionsController {
    constructor(
        private readonly transactionsService: TransactionsService,
    ) {}

    @Post()
    create(
        @CurrentUser() user: AuthUser,
        @Body() createTransactionDto: CreateTransactionDto,
    ) {
        return this.transactionsService.create(user.id, createTransactionDto);
    }

    @Get()
    findAll(
        @CurrentUser() user: AuthUser,
        @Query() query: QueryTransactionsDto,
    ) {
        return this.transactionsService.findAll(user.id, query);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.transactionsService.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTransactionDto: UpdateTransactionDto,
    ) {
        return this.transactionsService.update(
            user.id,
            id,
            updateTransactionDto,
        );
    }

    @Delete(':id')
    @HttpCode(204)
    remove(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.transactionsService.remove(user.id, id);
    }
}
