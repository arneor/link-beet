import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RequestSplashOtpDto {
    @ApiProperty({ description: 'Guest Email', example: 'guest@example.com' })
    @IsEmail()
    email: string;
}

export class VerifySplashOtpDto {
    @ApiProperty({ description: 'Guest Email', example: 'guest@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: '6-digit OTP code', example: '123456' })
    @IsString()
    @MinLength(6)
    @MaxLength(6)
    otp: string;
}
