import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator.js';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    getSummary(@CurrentUser() user: AuthUser) {
        return this.dashboardService.getSummary(user.id);
    }
}
