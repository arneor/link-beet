import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { BusinessService } from './business.service';
import { CreateBusinessDto, UpdateBusinessDto, BusinessResponseDto, DashboardStatsDto } from './dto/business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Business')
@Controller('business')
export class BusinessController {
    constructor(private readonly businessService: BusinessService) { }

    @Post('register')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Register new business',
        description: 'Create a new business profile for the authenticated user'
    })
    @ApiResponse({ status: 201, description: 'Business created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async register(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateBusinessDto,
    ) {
        const business = await this.businessService.create(userId, dto);
        return {
            id: business._id,
            businessName: business.businessName,
            ownerId: business.ownerId,
            location: business.location,
            contactEmail: business.contactEmail,
            category: business.category,
            isActive: business.isActive,
            onboardingCompleted: business.onboardingCompleted,
        };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @SkipThrottle()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get current user business',
        description: 'Get the business profile for the authenticated user'
    })
    @ApiResponse({ status: 200, description: 'Business profile' })
    @ApiResponse({ status: 404, description: 'No business found' })
    async getMyBusiness(@CurrentUser('userId') userId: string) {
        const business = await this.businessService.findByOwnerId(userId);

        if (!business) {
            return { business: null };
        }

        return {
            id: business._id,
            businessName: business.businessName,
            location: business.location,
            contactEmail: business.contactEmail,
            category: business.category,
            logoUrl: business.logoUrl,
            primaryColor: business.primaryColor,
            wifiSsid: business.wifiSsid,
            googleReviewUrl: business.googleReviewUrl,
            profileType: business.profileType,
            isActive: business.isActive,
            onboardingCompleted: business.onboardingCompleted,
            adsCount: business.ads.length,
        };
    }

    @Get('dashboard')
    @UseGuards(JwtAuthGuard)
    @SkipThrottle()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get dashboard statistics',
        description: 'Get analytics and statistics for the business dashboard'
    })
    @ApiResponse({ status: 200, description: 'Dashboard statistics', type: DashboardStatsDto })
    async getDashboard(@CurrentUser() user: any) {
        if (!user.businessId) {
            return {
                totalConnections: 0,
                activeUsers: 0,
                totalAdsServed: 0,
                totalViews: 0,
                totalClicks: 0,
                ctr: 0,
                revenue: 0,
                connectionsHistory: [],
            };
        }

        return this.businessService.getDashboardStats(user.businessId, user.userId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @SkipThrottle()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get business by ID' })
    @ApiParam({ name: 'id', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'Business profile' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    async getById(@Param('id') id: string) {
        const business = await this.businessService.findById(id);
        return {
            id: business._id,
            businessName: business.businessName,
            location: business.location,
            contactEmail: business.contactEmail,
            category: business.category,
            logoUrl: business.logoUrl,
            primaryColor: business.primaryColor,
            wifiSsid: business.wifiSsid,
            googleReviewUrl: business.googleReviewUrl,
            profileType: business.profileType,
            isActive: business.isActive,
            adsCount: business.ads.length,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update business profile' })
    @ApiParam({ name: 'id', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'Business updated' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    async update(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateBusinessDto,
    ) {
        const business = await this.businessService.update(id, userId, dto);
        return {
            id: business._id,
            businessName: business.businessName,
            location: business.location,
            contactEmail: business.contactEmail,
            isActive: business.isActive,
            onboardingCompleted: business.onboardingCompleted,
        };
    }

    @Get(':id/stats')
    @UseGuards(JwtAuthGuard)
    @SkipThrottle()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get business dashboard stats' })
    @ApiParam({ name: 'id', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'Dashboard statistics', type: DashboardStatsDto })
    async getStats(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
    ) {
        return this.businessService.getDashboardStats(id, userId);
    }

    // Public endpoint for captive portal
    @Get('splash/:id')
    @SkipThrottle()
    @ApiOperation({
        summary: 'Get splash page data (public)',
        description: 'Get business and ads data for captive portal display'
    })
    @ApiParam({ name: 'id', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'Splash page data' })
    async getSplash(@Param('id') id: string) {
        return this.businessService.getSplashData(id);
    }
}
