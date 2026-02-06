// Username Service - Validation, generation, and availability checking
import { Injectable, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = new Set([
    // System routes
    'admin', 'api', 'app', 'auth', 'blog', 'business', 'catalog',
    'checkout', 'dashboard', 'docs', 'help', 'home', 'login', 'logout',
    'onboarding', 'privacy', 'profile', 'settings', 'signup', 'signin',
    'splash', 'support', 'terms', 'user', 'users', 'www',

    // Brand protection
    'markmorph', 'mark-morph', 'linktree', 'link', 'official',

    // Common reserved
    'null', 'undefined', 'anonymous', 'root', 'system',
]);

const USERNAME_REGEX = /^[a-z0-9][a-z0-9-_]*[a-z0-9]$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 30;

export interface UsernameValidation {
    isValid: boolean;
    isAvailable: boolean;
    errors: string[];
    suggestions?: string[];
}

@Injectable()
export class UsernameService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    /**
     * Check if a username is available and valid
     */
    async checkAvailability(username: string): Promise<UsernameValidation> {
        const normalizedUsername = this.normalize(username);
        const errors: string[] = [];

        // Validate format
        if (normalizedUsername.length < MIN_LENGTH) {
            errors.push(`Username must be at least ${MIN_LENGTH} characters`);
        }

        if (normalizedUsername.length > MAX_LENGTH) {
            errors.push(`Username cannot exceed ${MAX_LENGTH} characters`);
        }

        if (!USERNAME_REGEX.test(normalizedUsername)) {
            errors.push('Username can only contain lowercase letters, numbers, hyphens, and underscores. It must start and end with a letter or number.');
        }

        // Check reserved
        if (RESERVED_USERNAMES.has(normalizedUsername)) {
            errors.push('This username is reserved');
        }

        if (errors.length > 0) {
            return { isValid: false, isAvailable: false, errors };
        }

        // Check database availability
        const isAvailable = await this.isAvailable(normalizedUsername);

        if (!isAvailable) {
            const suggestions = await this.generateSuggestions(normalizedUsername);
            return {
                isValid: true,
                isAvailable: false,
                errors: ['This username is already taken'],
                suggestions,
            };
        }

        return { isValid: true, isAvailable: true, errors: [] };
    }

    /**
     * Check if username is available in database
     */
    async isAvailable(username: string): Promise<boolean> {
        const normalizedUsername = this.normalize(username);

        // Check cache first
        const cacheKey = `username:${normalizedUsername}`;
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached === 'taken') return false;
        } catch {
            // Redis unavailable, continue with DB check
        }

        // Check users table
        const existingUser = await this.prisma.user.findUnique({
            where: { username: normalizedUsername },
            select: { id: true },
        });

        if (existingUser) {
            // Cache the result
            try {
                await this.redis.set(cacheKey, 'taken', 'EX', 3600);
            } catch {
                // Redis unavailable
            }
            return false;
        }

        // Check old usernames (for redirects)
        const oldUsername = await this.prisma.usernameHistory.findUnique({
            where: { oldUsername: normalizedUsername },
            select: { id: true },
        });

        if (oldUsername) {
            return false;
        }

        // Check reserved usernames table
        const reserved = await this.prisma.reservedUsername.findUnique({
            where: { username: normalizedUsername },
            select: { id: true },
        });

        return !reserved;
    }

    /**
     * Claim/update a username for a user
     */
    async claimUsername(userId: string, newUsername: string): Promise<void> {
        const normalizedUsername = this.normalize(newUsername);

        // Validate
        const validation = await this.checkAvailability(normalizedUsername);
        if (!validation.isValid) {
            throw new BadRequestException(validation.errors.join(', '));
        }

        // Get current user
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Check if username is available (might have been claimed between validation and save)
        if (!await this.isAvailable(normalizedUsername)) {
            throw new ConflictException('Username is no longer available');
        }

        // If user already has a username, save it to history
        if (user.username && user.username !== normalizedUsername) {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 6); // 6 months for redirects

            await this.prisma.usernameHistory.create({
                data: {
                    userId,
                    oldUsername: user.username,
                    expiresAt,
                },
            });

            // Invalidate old username cache
            try {
                await this.redis.del(`username:${user.username}`);
            } catch {
                // Redis unavailable
            }
        }

        // Update username
        await this.prisma.user.update({
            where: { id: userId },
            data: { username: normalizedUsername },
        });

        // Cache new username as taken
        try {
            await this.redis.set(`username:${normalizedUsername}`, 'taken', 'EX', 3600);
        } catch {
            // Redis unavailable
        }
    }

    /**
     * Generate username from business name
     */
    generateFromBusinessName(businessName: string, location?: string): string {
        let base = slugify(businessName, {
            lower: true,
            strict: true,
            replacement: '-',
        });

        // Ensure minimum length
        if (base.length < MIN_LENGTH) {
            base = base + '-store';
        }

        // Add location suffix if provided
        if (location) {
            const locationSlug = slugify(location, {
                lower: true,
                strict: true,
                replacement: '-',
            }).slice(0, 10);

            base = `${base}-${locationSlug}`;
        }

        // Truncate to max length
        return base.slice(0, MAX_LENGTH);
    }

    /**
     * Generate suggestion alternatives for taken username
     */
    async generateSuggestions(baseUsername: string): Promise<string[]> {
        const suggestions: string[] = [];
        const suffixes = ['01', '02', 'india', 'official', 'store', 'shop', 'biz'];

        for (const suffix of suffixes) {
            if (suggestions.length >= 3) break;

            const suggestion = `${baseUsername.slice(0, MAX_LENGTH - suffix.length - 1)}-${suffix}`;

            if (await this.isAvailable(suggestion)) {
                suggestions.push(suggestion);
            }
        }

        // If still not enough, try random numbers
        while (suggestions.length < 3) {
            const randomNum = Math.floor(Math.random() * 99) + 1;
            const suggestion = `${baseUsername.slice(0, MAX_LENGTH - 3)}${randomNum.toString().padStart(2, '0')}`;

            if (await this.isAvailable(suggestion) && !suggestions.includes(suggestion)) {
                suggestions.push(suggestion);
            }
        }

        return suggestions;
    }

    /**
     * Normalize username to lowercase
     */
    private normalize(username: string): string {
        return username.toLowerCase().trim();
    }

    /**
     * Get redirect URL for old username (UsernameHistory)
     */
    async getRedirectForOldUsername(oldUsername: string): Promise<string | null> {
        const history = await this.prisma.usernameHistory.findUnique({
            where: { oldUsername: this.normalize(oldUsername) },
            include: { user: { select: { username: true } } },
        });

        if (!history || !history.user || history.expiresAt < new Date()) {
            return null;
        }

        return history.user.username;
    }
}
