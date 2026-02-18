/**
 * Environment Validation Guard
 * ============================
 * This module validates that environment-specific secrets are configured
 * correctly at startup. It prevents catastrophic misconfigurations like:
 *   - Dev environment connecting to production database
 *   - Missing JWT secrets in production
 *   - Missing critical third-party API keys
 *
 * Usage: Import and call validateEnvironment() in main.ts before bootstrap.
 */

import { Logger } from '@nestjs/common';

export interface EnvironmentConfig {
    NODE_ENV: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_ADMIN_SECRET?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_BUCKET_NAME?: string;
    RESEND_API_KEY?: string;
    GOOGLE_CLIENT_ID?: string;
}

const UNSAFE_JWT_SECRETS = [
    'your-secret-key',
    'your-super-secret-jwt-key-change-in-production',
    'change-me-generate-strong-secret',
    'linkbeet-dev-secret-change-in-production-2024',
];

/**
 * Validates environment configuration at startup.
 * Throws an error and prevents boot if critical misconfigurations are detected.
 */
export function validateEnvironment(): void {
    const logger = new Logger('EnvironmentGuard');
    const env = process.env.NODE_ENV || 'development';
    const mongoUri = process.env.MONGODB_URI || '';
    const jwtSecret = process.env.JWT_SECRET || '';
    const warnings: string[] = [];
    const errors: string[] = [];

    logger.log(`🔍 Validating environment: ${env}`);

    // ─── Critical: Database URI must be set ───
    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/linkbeet_dev') {
        if (env === 'production') {
            errors.push('MONGODB_URI is not configured for production!');
        } else {
            warnings.push('MONGODB_URI is using localhost fallback.');
        }
    }

    // ─── Critical: Prevent dev from connecting to prod database ───
    if (env !== 'production' && mongoUri) {
        // If the URI contains clear production identifiers, block it
        const prodIndicators = ['linkbeet_prod', 'prod-cluster', 'production'];
        const looksLikeProd = prodIndicators.some(indicator =>
            mongoUri.toLowerCase().includes(indicator),
        );
        if (looksLikeProd) {
            errors.push(
                `🚨 CRITICAL: ${env} environment is connecting to a PRODUCTION database!\n` +
                `   URI contains production indicator. This is NEVER allowed.\n` +
                `   Set MONGODB_URI to a dev/staging database URI.`,
            );
        }
    }

    // ─── Critical: JWT secrets must be strong in production ───
    if (env === 'production') {
        if (!jwtSecret || UNSAFE_JWT_SECRETS.includes(jwtSecret)) {
            errors.push('JWT_SECRET is using a default/weak value in production! Generate a strong secret.');
        }
        if (jwtSecret.length < 32) {
            errors.push('JWT_SECRET must be at least 32 characters in production.');
        }
    }

    // ─── Warning: Check for commonly missing config ───
    if (env === 'production') {
        if (!process.env.RESEND_API_KEY) {
            warnings.push('RESEND_API_KEY is not set. Email sending will fail in production.');
        }
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            warnings.push('AWS credentials are not set. File uploads will fail.');
        }
        if (!process.env.GOOGLE_CLIENT_ID) {
            warnings.push('GOOGLE_CLIENT_ID is not set. Google OAuth will fail.');
        }
        if (!process.env.CORS_ORIGINS) {
            warnings.push('CORS_ORIGINS is not set. Using hardcoded defaults.');
        }
    }

    // ─── Print warnings ───
    for (const warning of warnings) {
        logger.warn(`⚠️  ${warning}`);
    }

    // ─── Abort on errors ───
    if (errors.length > 0) {
        for (const error of errors) {
            logger.error(`❌ ${error}`);
        }
        logger.error(`\n🛑 Environment validation FAILED with ${errors.length} error(s). Fix above issues and restart.\n`);
        process.exit(1);
    }

    logger.log(`✅ Environment validation passed (${warnings.length} warning(s))`);
}
