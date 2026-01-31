import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    ForbiddenException,
    Req,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { BusinessService } from './business.service';
import { CreateBusinessDto, UpdateBusinessDto, BusinessResponseDto, DashboardStatsDto } from './dto/business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
        description: 'Create a new business profile for the authenticated user. Business will be in pending_approval status.'
    })
    @ApiResponse({ status: 201, description: 'Business created successfully (pending approval)' })
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
            status: business.status,
            isActive: business.isActive,
            onboardingCompleted: business.onboardingCompleted,
            message: 'Business registered successfully. Pending admin approval.',
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
            status: business.status,
            isActive: business.isActive,
            onboardingCompleted: business.onboardingCompleted,
            adsCount: business.ads.length,
            rejectionReason: business.rejectionReason,
            suspensionReason: business.suspensionReason,
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
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    async getById(
        @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        const business = await this.businessService.findById(id);

        // Check ownership (admins can access any business)
        const isAdmin = user.type === 'admin' || user.role === 'super_admin' || user.role === 'admin';
        const isOwner = business.ownerId.toString() === user.userId;

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException('You do not have permission to access this business');
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
            status: business.status,
            isActive: business.isActive,
            adsCount: business.ads.length,
            ads: business.ads, // Expose ads for editing
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
        @CurrentUser() user: any,
        @Body() dto: UpdateBusinessDto,
    ) {
        // Admins can update any business, owners can only update their own
        const isAdmin = user.type === 'admin' || user.role === 'super_admin' || user.role === 'admin';
        const business = await this.businessService.update(id, user.userId, dto, isAdmin);

        return {
            id: business._id,
            businessName: business.businessName,
            location: business.location,
            contactEmail: business.contactEmail,
            status: business.status,
            isActive: business.isActive,
            onboardingCompleted: business.onboardingCompleted,
        };
    }

    @Post(':id/upload')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload media (logo, banners, gallery)' })
    @ApiParam({ name: 'id', description: 'Business ID' })
    @ApiResponse({ status: 201, description: 'File uploaded and profile updated' })
    async upload(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
        @Body('placement') placement: string
    ) {
        if (!file) {
            throw new ForbiddenException('No file uploaded');
        }

        // Normalize placement
        if (!placement || !['branding', 'banner', 'gallery'].includes(placement)) {
            placement = 'gallery';
        }

        const isAdmin = user.type === 'admin' || user.role === 'super_admin' || user.role === 'admin';
        return this.businessService.uploadMedia(id, file, placement, user.userId, isAdmin);
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
        @CurrentUser() user: any,
    ) {
        // Admins can view any business stats
        const isAdmin = user.type === 'admin' || user.role === 'super_admin' || user.role === 'admin';
        return this.businessService.getDashboardStats(id, user.userId, isAdmin);
    }

    @Get(':id/access-logs')
    @UseGuards(JwtAuthGuard)
    @SkipThrottle()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get admin access logs for business',
        description: 'Business owners can see when admins accessed their data (transparency)'
    })
    @ApiParam({ name: 'id', description: 'Business ID' })
    @ApiResponse({ status: 200, description: 'Access logs' })
    async getAccessLogs(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        // Verify ownership
        const business = await this.businessService.findById(id);
        if (business.ownerId.toString() !== user.userId) {
            throw new ForbiddenException('You can only view access logs for your own business');
        }

        return this.businessService.getAdminAccessLogs(id);
    }

    // Public endpoint for captive portal - MOVED TO SPLASH MODULE
    // @Get('splash/:id') is now handled by SplashController
}
