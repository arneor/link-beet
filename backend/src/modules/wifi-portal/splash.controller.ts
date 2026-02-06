import { Controller, Post, Body, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../auth/services/auth.service';
import { RequestSplashOtpDto, VerifySplashOtpDto } from './splash.dto';

@ApiTags('Splash Screen (WiFi Portal)')
@Controller('splash')
export class SplashController {
    constructor(private readonly authService: AuthService) { }

    @Post(':businessId/request-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request OTP for Guest WiFi Access' })
    @ApiResponse({ status: 200, description: 'OTP sent' })
    async requestOtp(
        @Param('businessId') businessId: string, // Not used for Auth, but required for route matching
        @Body() dto: RequestSplashOtpDto,
    ) {
        // We could validate businessId here if needed
        return this.authService.sendGuestOtp(dto.email);
    }

    @Post(':businessId/verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify OTP and get Guest Session' })
    @ApiResponse({ status: 200, description: 'Authenticated' })
    async verifyOtp(
        @Param('businessId') businessId: string,
        @Body() dto: VerifySplashOtpDto,
    ) {
        return this.authService.verifyGuestOtp(dto.email, dto.otp);
    }
}
