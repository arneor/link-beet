import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './auth.controller';

// Services
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

// Common modules
import { UsernameModule } from '../../common/username/username.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { SupabaseModule } from '../../common/supabase/supabase.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
    imports: [
        PrismaModule,
        SupabaseModule,
        RedisModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
                },
            }),
            inject: [ConfigService],
        }),
        UsernameModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, EmailService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule { }
