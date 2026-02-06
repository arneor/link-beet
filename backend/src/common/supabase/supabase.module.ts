// Supabase Configuration Module
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';
export const SUPABASE_ADMIN_CLIENT = 'SUPABASE_ADMIN_CLIENT';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: SUPABASE_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): SupabaseClient => {
                const supabaseUrl = configService.get<string>('SUPABASE_URL');
                const supabaseAnonKey = configService.get<string>('SUPABASE_ANON_KEY');

                if (!supabaseUrl || !supabaseAnonKey) {
                    throw new Error('Supabase configuration is missing');
                }

                return createClient(supabaseUrl, supabaseAnonKey, {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: false,
                    },
                });
            },
        },
        {
            provide: SUPABASE_ADMIN_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): SupabaseClient => {
                const supabaseUrl = configService.get<string>('SUPABASE_URL');
                const supabaseServiceRoleKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

                if (!supabaseUrl || !supabaseServiceRoleKey) {
                    throw new Error('Supabase configuration (Service Role) is missing');
                }

                return createClient(supabaseUrl, supabaseServiceRoleKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false,
                    },
                });
            },
        },
    ],
    exports: [SUPABASE_CLIENT, SUPABASE_ADMIN_CLIENT],
})
export class SupabaseModule { }
