import { Injectable, UnauthorizedException, BadRequestException, ConflictException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UsernameService } from '../../../common/username/username.service';
import { SUPABASE_CLIENT } from '../../../common/supabase/supabase.module';
import { REDIS_CLIENT } from '../../../common/redis/redis.module';
import { UserCategory } from '@prisma/client';
import { EmailService } from './email.service';

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}

export interface AuthUser {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
    category: UserCategory | null;
    isActive: boolean;
    emailVerified: boolean;
    onboardingStep: number;
    hasProfile: boolean;
    hasBusiness?: boolean;
    businessId?: string;
    businessName?: string;
    phone?: string; // Added for compliance
    macAddress?: string; // Added for compliance
    creatorType?: string | null;
    role: string;
}

export interface SignupResult {
    success: boolean;
    message: string;
    requiresOtp?: boolean;
    userId?: string;
    email?: string;
}

export interface OtpVerifyResult {
    success: boolean;
    tokens?: AuthTokens;
    user?: AuthUser;
    requiresOnboarding?: boolean;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly OTP_EXPIRY = 600; // 10 minutes
    private readonly OTP_RATE_LIMIT = 5; // Relaxed limit

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly usernameService: UsernameService,
        private readonly emailService: EmailService,
        @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
        @Inject('SUPABASE_ADMIN_CLIENT') private readonly supabaseAdmin: SupabaseClient,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    // ==================== Email/Password + OTP Auth ====================

    /**
     * Step 1: Signup Initiate - Validate email, store pending data, send OTP
     */
    async signupInitiate(email: string, password: string): Promise<SignupResult> {
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered. Please login.');
        }

        // Check Rate Limit for Signup
        const rateKey = `signup_limit:${normalizedEmail}`;
        const requestCount = await this.redis.get(rateKey);
        if (requestCount && parseInt(requestCount) >= this.OTP_RATE_LIMIT) {
            throw new BadRequestException('Too many signup requests. Please wait a while.');
        }

        // Generate OTP
        const otp = this.generateOtpCode();
        const signupKey = `signup_pending:${normalizedEmail}`;
        const otpKey = `otp:${normalizedEmail}`;

        // Store signup data in Redis (Email, Password) - Expires in 10 mins
        // Note: Password stored temporarily until verification completes
        const payload = JSON.stringify({ email: normalizedEmail, password });
        await this.redis.set(signupKey, payload, 'EX', this.OTP_EXPIRY);

        // Store OTP for verification
        await this.redis.set(otpKey, otp, 'EX', this.OTP_EXPIRY);

        // Increment Rate Limit
        await this.redis.incr(rateKey);
        await this.redis.expire(rateKey, this.OTP_EXPIRY);

        // Send OTP via Email
        await this.emailService.sendOtp(normalizedEmail, otp);

        return {
            success: true,
            message: 'Verification code sent to email',
            email: normalizedEmail,
        };
    }

    /**
     * Step 2: Signup Verify - Verify OTP, Create Supabase User, Create Prisma User
     */
    async signupVerify(email: string, otp: string): Promise<OtpVerifyResult> {
        const normalizedEmail = email.toLowerCase().trim();
        const signupKey = `signup_pending:${normalizedEmail}`;
        const otpKey = `otp:${normalizedEmail}`;

        // Retrieve pending data
        const payloadStr = await this.redis.get(signupKey);
        if (!payloadStr) {
            throw new BadRequestException('Signup session expired or invalid. Please try again.');
        }

        const storedOtp = await this.redis.get(otpKey);
        if (!storedOtp || storedOtp !== otp) {
            throw new UnauthorizedException('Invalid or expired verification code');
        }

        const payload = JSON.parse(payloadStr);

        // 1. Create User in Supabase (Pre-verified)
        let userId: string;

        const { data: supabaseUser, error } = await this.supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password: payload.password,
            email_confirm: true,
            user_metadata: { source: 'custom_signup' }
        });

        if (error) {
            // Check if user already exists (Desync case: Exists in Supabase, not in Prisma)
            // Error message usually contains "already registered" or status 422
            if (error.message?.includes('already registered') || (error as any).status === 422) {
                this.logger.warn(`User ${normalizedEmail} already exists in Supabase. Attempting to link...`);

                // Verify credentials to ensure ownership
                const { data: existingUser, error: signInError } = await this.supabase.auth.signInWithPassword({
                    email: normalizedEmail,
                    password: payload.password
                });

                if (signInError || !existingUser.user) {
                    throw new BadRequestException(`Email already registered with diverse credentials. Please login.`);
                }

                userId = existingUser.user.id;
            } else {
                this.logger.error(`Supabase create error: ${error.message}`);
                throw new BadRequestException(`Failed to create user account: ${error.message}`);
            }
        } else {
            if (!supabaseUser.user) {
                throw new BadRequestException('Failed to create user account');
            }
            userId = supabaseUser.user.id;
        }

        // Clear pending data
        await this.redis.del(signupKey);
        await this.redis.del(otpKey);

        // 2. Create User in Prisma
        const tempUsername = await this.generateTempUsername(normalizedEmail);
        const newUser = await this.prisma.user.create({
            data: {
                id: userId, // Sync ID
                email: normalizedEmail,
                username: tempUsername,
                emailVerified: true,
                onboardingStep: 1,
            },
            include: {
                profile: true,
                business: true
            }
        });

        // 3. Generate Tokens
        const tokens = await this.generateTokens(newUser.id, newUser.email, newUser.category);
        const authUser = this.mapToAuthUser(newUser);

        return {
            success: true,
            tokens,
            user: authUser,
            requiresOnboarding: true, // Always true for new signup
        };
    }

    /**
     * Login with Email & Password
     */
    async login(email: string, password: string): Promise<OtpVerifyResult> {
        // Sign in with Supabase
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Sync/Get User from Prisma
        let user = await this.prisma.user.findUnique({
            where: { id: data.user.id },
            include: { profile: true, business: true }
        });

        if (!user) {
            throw new UnauthorizedException('User record not found.');
        }

        // Update Last Login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        const tokens = await this.generateTokens(user.id, user.email, user.category);
        const authUser = this.mapToAuthUser(user);

        // Log Compliance (Optional for login)
        await this.logCompliance(user.id, {
            macAddress: 'login-flow',
            businessId: user.business?.id
        });

        return {
            success: true,
            tokens,
            user: authUser,
            requiresOnboarding: user.onboardingStep < 4,
        };
    }

    /**
     * Send OTP Code for Guest WiFi (Splash Screen)
     */
    async sendGuestOtp(email: string): Promise<{ success: boolean; message: string }> {
        const normalizedEmail = email.toLowerCase().trim();

        // Rate Limit Check
        const rateKey = `otp_rate:${normalizedEmail}`;
        const requestCount = await this.redis.get(rateKey);
        if (requestCount && parseInt(requestCount) >= this.OTP_RATE_LIMIT) {
            throw new BadRequestException('Too many OTP requests. Please wait a while.');
        }

        // Generate OTP
        const otp = this.generateOtpCode();
        const otpKey = `otp:${normalizedEmail}`;

        // Store in Redis
        await this.redis.set(otpKey, otp, 'EX', this.OTP_EXPIRY);

        // Increment Rate Limit
        await this.redis.incr(rateKey);
        await this.redis.expire(rateKey, this.OTP_EXPIRY);

        // Send via Email Service
        await this.emailService.sendOtp(normalizedEmail, otp);

        return {
            success: true,
            message: 'OTP sent to your email',
        };
    }

    /**
     * Verify Guest OTP and Return Session
     */
    async verifyGuestOtp(email: string, otp: string, macAddress?: string): Promise<OtpVerifyResult> {
        const normalizedEmail = email.toLowerCase().trim();
        const otpKey = `otp:${normalizedEmail}`;

        const storedOtp = await this.redis.get(otpKey);
        if (!storedOtp || storedOtp !== otp) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        // Clear OTP after successful verification
        await this.redis.del(otpKey);

        // Find or Create User (Guest)
        let user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: {
                profile: { select: { id: true } },
                business: { select: { id: true } },
            },
        });

        if (!user) {
            const tempUsername = await this.generateTempUsername(normalizedEmail);
            user = await this.prisma.user.create({
                data: {
                    email: normalizedEmail,
                    username: tempUsername,
                    category: UserCategory.CREATOR, // Guests default to CREATOR
                    emailVerified: true,
                    onboardingStep: 1,
                },
                include: {
                    profile: { select: { id: true } },
                    business: { select: { id: true } },
                },
            });
        } else {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: true, lastLoginAt: new Date() },
            });
        }

        // Log Compliance Data for WiFi Access
        await this.logCompliance(user.id, {
            macAddress: macAddress || 'guest-flow',
            businessId: user.business?.id // Typically guests don't own business, but we log context if relevant
        });

        const tokens = await this.generateTokens(user.id, user.email, user.category);
        const authUser = this.mapToAuthUser(user);

        return {
            success: true,
            tokens,
            user: authUser,
            requiresOnboarding: false,
        };
    }

    // ==================== Onboarding ====================

    async updateUserCategory(userId: string, category: UserCategory): Promise<AuthUser> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                category,
                onboardingStep: 2, // Next is profile
            },
            include: {
                profile: true,
                business: true
            }
        });
        return this.mapToAuthUser(user);
    }

    async claimUsername(userId: string, username: string): Promise<AuthUser> {
        await this.usernameService.claimUsername(userId, username);
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { onboardingStep: 4 }, // Finished!
            include: {
                profile: true,
                business: true
            }
        });
        return this.mapToAuthUser(user);
    }

    async completeOnboarding(
        userId: string,
        data: {
            displayName?: string;
            bio?: string;
            businessName?: string;
            businessType?: string;
            location?: string;
            creatorType?: string;
        },
    ): Promise<AuthUser> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, business: true },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Update user display name and creator type
        if (data.displayName || data.creatorType) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    displayName: data.displayName || user.displayName,
                    creatorType: data.creatorType || user.creatorType,
                },
            });
        }

        // Create or update profile
        await this.prisma.profile.upsert({
            where: { userId },
            create: {
                userId,
                bio: data.bio,
                location: data.location,
                isPublished: false,
            },
            update: {
                bio: data.bio,
                location: data.location,
            },
        });

        // Create business for EVERYONE (Creators and Businesses both get a 'Space' dashboard)
        const bName = data.businessName || data.displayName || user.displayName || user.username;
        if (bName) {
            await this.prisma.business.upsert({
                where: { userId },
                create: {
                    userId,
                    businessName: bName,
                    businessType: (data.businessType as any) || 'OTHER',
                    location: data.location,
                },
                update: {
                    businessName: bName,
                    businessType: (data.businessType as any) || 'OTHER',
                    location: data.location,
                },
            });
        }

        // Mark onboarding complete
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { onboardingStep: 3 }, // Step 3 = Next is Username
            include: {
                profile: { select: { id: true } },
                business: { select: { id: true } },
            },
        });

        return this.mapToAuthUser(updatedUser);
    }

    // ==================== Token Management ====================

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_SECRET'),
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.isActive) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.generateTokens(user.id, user.email, user.category);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async getCurrentUser(userId: string): Promise<AuthUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: { select: { id: true } },
                business: { select: { id: true } },
            },
        });

        return user ? this.mapToAuthUser(user) : null;
    }

    // ==================== Private Helpers ====================

    /**
     * Legacy method for JwtStrategy
     */
    async getUserFromToken(userId: string): Promise<AuthUser | null> {
        return this.getCurrentUser(userId);
    }

    private async logCompliance(userId: string, meta: { macAddress?: string; businessId?: string; phone?: string }) {
        try {
            // Cast to any to avoid IDE errors when Prisma types are not yet synced
            await (this.prisma as any).complianceLog.create({
                data: {
                    macAddress: meta.macAddress || 'unknown',
                    phone: meta.phone,
                    userId: userId,
                    businessId: meta.businessId,
                    loginTime: new Date(),
                }
            });
        } catch (error) {
            this.logger.error(`Failed to log compliance: ${error.message}`);
            // Don't fail the request, just log error
        }
    }

    private async generateTokens(userId: string, email: string, category: UserCategory | null): Promise<AuthTokens> {
        const role = category === UserCategory.BUSINESS ? 'business' : 'user';
        const payload = { sub: userId, email, category, role };
        const expiresIn = 7 * 24 * 60 * 60; // 7 days

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '7d', // String format for clarity
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '30d',
        });

        return { accessToken, refreshToken, expiresIn };
    }

    private async generateTempUsername(email: string): Promise<string> {
        const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
        const timestamp = Date.now().toString(36).slice(-4);
        const tempUsername = `${base.slice(0, 20)}-${timestamp}`;

        const isAvailable = await this.usernameService.isAvailable(tempUsername);
        if (isAvailable) {
            return tempUsername;
        }

        return `${tempUsername}${Math.floor(Math.random() * 99)}`;
    }

    private generateOtpCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private mapToAuthUser(user: any): AuthUser {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            category: user.category,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            onboardingStep: user.onboardingStep,
            hasProfile: !!user.profile,
            hasBusiness: !!user.business,
            businessId: user.business?.id,
            businessName: user.business?.businessName,
            creatorType: user.creatorType,
            role: user.category === UserCategory.BUSINESS ? 'business' : 'user',
        };
    }
}
