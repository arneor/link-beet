import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService, AuthUser, AuthTokens, SignupResult, OtpVerifyResult } from './services/auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  SendOtpDto,
  UpdateCategoryDto,
  ClaimUsernameDto,
  CompleteOnboardingDto,
  CheckUsernameDto,
  AuthSignupInitDto,
  AuthSignupVerifyDto,
  AuthLoginDto,
} from './dto/auth.dto';
import { UsernameService } from '../../common/username/username.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usernameService: UsernameService,
    private readonly configService: ConfigService,
  ) { }

  // ==================== Email/Password + OTP Flow (Standard) ====================

  @Post('signup/initiate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Initiate Signup (Send OTP)' })
  @ApiResponse({ status: 200, description: 'OTP sent' })
  async signupInitiate(@Body() dto: AuthSignupInitDto) {
    return this.authService.signupInitiate(dto.email, dto.password);
  }

  @Post('signup/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Signup OTP and Create Account' })
  @ApiResponse({ status: 200, description: 'Account created, tokens issued' })
  async signupVerify(@Body() dto: AuthSignupVerifyDto): Promise<OtpVerifyResult> {
    return this.authService.signupVerify(dto.email, dto.otp);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Email and Password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: AuthLoginDto): Promise<OtpVerifyResult> {
    return this.authService.login(dto.email, dto.password);
  }

  // ==================== Guest / WiFi Portal OTP (Legacy Wrapper) ====================
  // These might be used by the Splash Screen flow

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP (Guest/MagicLink)' })
  async sendOtpV2(@Body() dto: SendOtpDto) {
    // Using AuthSignupInitDto logic or separate guest logic?
    // This endpoint was used for Magic Links and Guest OTPs.
    // If isSignup is false (login), it's magic link.
    // But we moved login to Email/Pass. 
    // If it's pure Guest WiFi OTP (no password), we use sendGuestOtp.
    return this.authService.sendGuestOtp(dto.email);
  }

  // ==================== Username ====================

  @Post('username/check') // Maintain v2 prefix if clients expect it, or simplify? 
  // Client api.ts uses `/auth/v2/username/check`. 
  // I will alias it to `/auth/username/check` effectively by keeping `auth` prefix.
  // So the client needs to change to `/auth/username/check` OR I keep `v2/` in path for these specific ones.
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check username availability' })
  async checkUsername(@Body() dto: CheckUsernameDto) {
    return this.usernameService.checkAvailability(dto.username);
  }

  @Post('username/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim a username' })
  async claimUsername(
    @CurrentUser() user: any,
    @Body() dto: ClaimUsernameDto,
  ): Promise<AuthUser> {
    return this.authService.claimUsername(user.userId, dto.username);
  }

  // ==================== Onboarding ====================

  @Post('onboarding/category')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set user category (Creator/Business)' })
  async updateCategory(
    @CurrentUser() user: any,
    @Body() dto: UpdateCategoryDto,
  ): Promise<AuthUser> {
    return this.authService.updateUserCategory(user.userId, dto.category);
  }

  @Post('onboarding/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete onboarding with profile details' })
  async completeOnboarding(
    @CurrentUser() user: any,
    @Body() dto: CompleteOnboardingDto,
  ): Promise<AuthUser> {
    return this.authService.completeOnboarding(user.userId, dto);
  }

  // ==================== User ====================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@CurrentUser() user: any): Promise<AuthUser | null> {
    return this.authService.getCurrentUser(user.userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthTokens> {
    return this.authService.refreshToken(refreshToken);
  }
}
