import {
    Controller,
    Get,
    Patch,
    Post,
    Body,
    UseGuards,
    Req,
    Param,
    Query,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WifiPortalService } from './wifi-portal.service';
import { UpdateWifiPortalDto, ConnectWifiDto } from '../business/dto/wifi-portal.dto';

@ApiTags('WiFi Portal')
@Controller('wifi-portal')
export class WifiPortalController {
    constructor(private readonly wifiPortalService: WifiPortalService) { }

    // ==================== Authenticated Owner Routes ====================

    @Get('config')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get portal configuration' })
    @ApiResponse({ status: 200, description: 'Portal configuration retrieved' })
    @ApiResponse({ status: 404, description: 'Portal not found' })
    async getPortalConfig(@Req() req: any) {
        return this.wifiPortalService.getPortalConfig(req.user.id);
    }

    @Patch('config')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update portal configuration' })
    @ApiResponse({ status: 200, description: 'Portal configuration updated' })
    async updatePortalConfig(@Req() req: any, @Body() dto: UpdateWifiPortalDto) {
        return this.wifiPortalService.updatePortalConfig(req.user.id, dto);
    }

    @Post('splash-image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload splash background image' })
    async uploadSplashImage(
        @Req() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.wifiPortalService.uploadSplashImage(req.user.id, file.buffer, file.originalname);
    }

    // ==================== Public Guest Routes ====================

    @Get('public/:businessId')
    @ApiOperation({ summary: 'Get public portal data by Business ID' })
    async getPublicPortal(@Param('businessId') businessId: string) {
        return this.wifiPortalService.getPublicPortal(businessId);
    }

    @Get('public/resolve/:username')
    @ApiOperation({ summary: 'Resolve username to Business ID' })
    async resolveUsername(@Param('username') username: string) {
        const businessId = await this.wifiPortalService.getBusinessIdByUsername(username);
        return { businessId };
    }

    @Post('connect/:businessId')
    @ApiOperation({ summary: 'Connect guest to WiFi' })
    async connectGuest(
        @Param('businessId') businessId: string,
        @Body() dto: ConnectWifiDto,
    ) {
        return this.wifiPortalService.connectGuest(businessId, dto);
    }
}
