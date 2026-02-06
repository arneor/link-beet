// Upstash Redis Configuration Module
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): Redis => {
                const redisUrl = configService.get<string>('UPSTASH_REDIS_URL');

                if (!redisUrl) {
                    console.warn('⚠️ UPSTASH_REDIS_URL not set, Redis features disabled');
                    // Return a dummy Redis instance for development without Redis
                    return new Redis({
                        host: 'localhost',
                        port: 6379,
                        lazyConnect: true,
                    });
                }

                // For Upstash Redis, the URL format is:
                // rediss://default:<password>@<host>:<port>
                const redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    retryStrategy: (times: number) => {
                        if (times > 3) return null;
                        return Math.min(times * 100, 3000);
                    },
                    lazyConnect: true,
                    tls: {
                        rejectUnauthorized: false,
                    },
                });

                redis.on('error', (err: Error) => {
                    console.error('Redis connection error:', err.message);
                });

                redis.on('connect', () => {
                    console.log('✅ Connected to Upstash Redis');
                });

                return redis;
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule { }
