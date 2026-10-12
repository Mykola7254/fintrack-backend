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
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator.js';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    create(
        @CurrentUser() user: AuthUser,
        @Body() createAccountDto: CreateAccountDto,
    ) {
        return this.accountsService.create(user.id, createAccountDto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.accountsService.findAll(user.id);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.accountsService.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAccountDto: UpdateAccountDto,
    ) {
        return this.accountsService.update(user.id, id, updateAccountDto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.accountsService.remove(user.id, id);
    }
}
