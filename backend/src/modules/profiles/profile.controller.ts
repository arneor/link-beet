// Profile Controller - API endpoints for link-tree profiles
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProfileService, ProfileData } from './profile.service';
import { LinksService } from './links.service';
import {
    UpdateProfileDto,
    CreateSocialLinkDto,
    CreateCustomLinkDto,
    UpdateSocialLinkDto,
    UpdateCustomLinkDto,
    ReorderLinksDto,
} from './dto/profile.dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
    private readonly logger = new Logger(ProfileController.name);

    constructor(
        private readonly profileService: ProfileService,
        private readonly linksService: LinksService,
    ) { }

    // ==================== Public Endpoints ====================

    @Get(':username')
    @ApiOperation({ summary: 'Get public profile by username' })
    @ApiResponse({ status: 200, description: 'Profile data' })
    @ApiResponse({ status: 404, description: 'Profile not found' })
    async getPublicProfile(
        @Param('username') username: string,
    ): Promise<ProfileData | null> {
        // Track view asynchronously
        this.profileService.incrementViews(username).catch(() => { });
        return this.profileService.getPublicProfile(username);
    }

    @Post('links/:linkId/click')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Track link click' })
    async trackClick(
        @Param('linkId') linkId: string,
        @Body('type') type: 'social' | 'custom',
    ) {
        await this.linksService.trackClick(linkId, type);
        return { success: true };
    }

    // ==================== Authenticated Endpoints ====================

    @Get('me/profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get my profile' })
    @ApiResponse({ status: 200, description: 'Return profile data' })
    @ApiResponse({ status: 404, description: 'Profile not found' })
    async getMyProfile(@CurrentUser() user: any): Promise<ProfileData | null> {
        return this.profileService.getMyProfile(user.sub);
    }

    @Put('me/profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update my profile' })
    async updateProfile(
        @CurrentUser() user: any,
        @Body() dto: UpdateProfileDto,
    ): Promise<ProfileData> {
        return this.profileService.updateProfile(user.sub, dto);
    }

    @Post('me/profile/picture')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload profile picture' })
    @ApiConsumes('multipart/form-data')
    async uploadProfilePicture(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ url: string }> {
        const url = await this.profileService.updateProfilePicture(
            user.sub,
            file.buffer,
            file.originalname,
        );
        return { url };
    }

    @Post('me/profile/background')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload background image' })
    @ApiConsumes('multipart/form-data')
    async uploadBackgroundImage(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ url: string }> {
        const url = await this.profileService.updateBackgroundImage(
            user.sub,
            file.buffer,
            file.originalname,
        );
        return { url };
    }

    // ==================== Social Links ====================

    @Post('me/social-links')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Add social link' })
    @ApiResponse({ status: 201, description: 'Social link added' })
    async addSocialLink(
        @CurrentUser() user: any,
        @Body() dto: CreateSocialLinkDto,
    ) {
        return this.linksService.addSocialLink(user.sub, dto);
    }

    @Put('me/social-links/:linkId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update social link' })
    async updateSocialLink(
        @CurrentUser() user: any,
        @Param('linkId') linkId: string,
        @Body() dto: UpdateSocialLinkDto,
    ) {
        return this.linksService.updateSocialLink(user.sub, linkId, dto);
    }

    @Delete('me/social-links/:linkId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete social link' })
    async deleteSocialLink(
        @CurrentUser() user: any,
        @Param('linkId') linkId: string,
    ) {
        await this.linksService.deleteSocialLink(user.sub, linkId);
    }

    @Put('me/social-links/reorder')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Reorder social links' })
    async reorderSocialLinks(
        @CurrentUser() user: any,
        @Body() dto: ReorderLinksDto,
    ) {
        await this.linksService.reorderSocialLinks(user.sub, dto.orders);
        return { success: true };
    }

    // ==================== Custom Links ====================

    @Post('me/custom-links')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Add custom link' })
    async addCustomLink(
        @CurrentUser() user: any,
        @Body() dto: CreateCustomLinkDto,
    ) {
        return this.linksService.addCustomLink(user.sub, dto);
    }

    @Put('me/custom-links/:linkId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update custom link' })
    async updateCustomLink(
        @CurrentUser() user: any,
        @Param('linkId') linkId: string,
        @Body() dto: UpdateCustomLinkDto,
    ) {
        return this.linksService.updateCustomLink(user.sub, linkId, dto);
    }

    @Delete('me/custom-links/:linkId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete custom link' })
    async deleteCustomLink(
        @CurrentUser() user: any,
        @Param('linkId') linkId: string,
    ) {
        await this.linksService.deleteCustomLink(user.sub, linkId);
    }

    @Put('me/custom-links/reorder')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Reorder custom links' })
    async reorderCustomLinks(
        @CurrentUser() user: any,
        @Body() dto: ReorderLinksDto,
    ) {
        await this.linksService.reorderCustomLinks(user.sub, dto.orders);
        return { success: true };
    }
}
