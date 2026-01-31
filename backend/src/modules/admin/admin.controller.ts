import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { AdminStatsDto, BusinessListItemDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    @Roles('admin')
    @SkipThrottle()
    @ApiOperation({
        summary: 'Get platform statistics',
        description: 'Get platform-wide statistics including total businesses, connections, and active campaigns'
    })
    @ApiResponse({ status: 200, description: 'Platform statistics', type: AdminStatsDto })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    async getStats(): Promise<AdminStatsDto> {
        return this.adminService.getStats();
    }

    @Get('businesses')
    @Roles('admin')
    @SkipThrottle()
    @ApiOperation({
        summary: 'List all businesses',
        description: 'Get all registered businesses with connection counts'
    })
    @ApiResponse({ status: 200, description: 'List of businesses', type: [BusinessListItemDto] })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    async getAllBusinesses(): Promise<BusinessListItemDto[]> {
        return this.adminService.getAllBusinesses();
    }

    @Get('connections/count')
    @Roles('admin')
    @SkipThrottle()
    @ApiOperation({ summary: 'Get total connection count' })
    @ApiResponse({
        status: 200,
        description: 'Total connection count',
        schema: {
            properties: {
                totalConnections: { type: 'number' },
            },
        },
    })
    async getConnectionCount() {
        const count = await this.adminService.getTotalConnectionCount();
        return { totalConnections: count };
    }
}
