import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { TransactionsService } from './transactions.service.js';

@Controller('transactions')
export class TransactionsController {
    constructor(
        private readonly transactionsService: TransactionsService,
    ) {}

    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionsService.create(createTransactionDto);
    }

    @Get()
    findAll(@Query('user_id') userId?: string) {
        return this.transactionsService.findAll(
            userId ? Number(userId) : undefined,
        );
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateTransactionDto: UpdateTransactionDto,
    ) {
        return this.transactionsService.update(
            Number(id),
            updateTransactionDto,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.transactionsService.remove(Number(id));
    }
}