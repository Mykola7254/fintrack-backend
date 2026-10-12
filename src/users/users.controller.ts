import { Body, Controller, Delete, Get, HttpCode, Patch } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    findMe(@CurrentUser() user: AuthUser) {
        return this.usersService.findOne(user.id);
    }

    @Patch('me')
    updateMe(
        @CurrentUser() user: AuthUser,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(user.id, updateUserDto);
    }

    @Delete('me')
    @HttpCode(204)
    removeMe(@CurrentUser() user: AuthUser) {
        return this.usersService.remove(user.id);
    }
}
