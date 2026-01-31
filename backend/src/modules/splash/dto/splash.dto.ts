import { IsEmail, IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestOtpDto {
    @ApiProperty({ description: 'User email address', example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({ description: 'User IP address' })
    @IsString()
    @IsOptional()
    ipAddress?: string;

    @ApiPropertyOptional({ description: 'Device info / user agent' })
    @IsString()
    @IsOptional()
    deviceInfo?: string;
}

export class VerifyOtpDto {
    @ApiProperty({ description: 'User email address', example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: '6-digit OTP code', example: '123456' })
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp: string;

    @ApiPropertyOptional({ description: 'Client session ID for tracking' })
    @IsString()
    @IsOptional()
    sessionId?: string;
}

export class OtpResponseDto {
    @ApiProperty({ description: 'Whether the request was successful' })
    success: boolean;

    @ApiProperty({ description: 'Response message' })
    message: string;

    @ApiPropertyOptional({ description: 'OTP expiry time in seconds' })
    expiresIn?: number;

    @ApiPropertyOptional({ description: 'Cooldown time in seconds before next request' })
    cooldown?: number;
}

export class VerifyResponseDto {
    @ApiProperty({ description: 'Whether verification was successful' })
    success: boolean;

    @ApiProperty({ description: 'Response message' })
    message: string;

    @ApiPropertyOptional({ description: 'Redirect URL after successful verification' })
    redirectUrl?: string;

    @ApiPropertyOptional({ description: 'WiFi user session token' })
    sessionToken?: string;
}

export class WifiUserInfoDto {
    @ApiProperty({ description: 'User email' })
    email: string;

    @ApiProperty({ description: 'Whether user is verified' })
    isVerified: boolean;

    @ApiProperty({ description: 'Number of visits' })
    visitCount: number;

    @ApiPropertyOptional({ description: 'Last visit date' })
    lastVisitAt?: Date;
}
