import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;
    private readonly fromEmail: string;

    constructor(private configService: ConfigService) {
        this.fromEmail = this.configService.get<string>('EMAIL_FROM') || '"Mark Morph" <noreply@markmorph.com>';

        const host = this.configService.get<string>('EMAIL_HOST');
        const port = this.configService.get<number>('EMAIL_PORT');
        const user = this.configService.get<string>('EMAIL_USER');
        const pass = this.configService.get<string>('EMAIL_PASS');

        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port: port || 587,
                secure: port === 465, // true for 465, false for other ports
                auth: {
                    user,
                    pass,
                },
            });
            this.logger.log(`📧 Email service configured with host: ${host}`);
        } else {
            this.logger.warn('⚠️ Email credentials not found. Using MOCK email service (logs only).');
        }
    }

    async sendOtp(email: string, otp: string): Promise<boolean> {
        const subject = 'Your Verification Code - Mark Morph';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333; text-align: center;">Verification Code</h2>
                <p style="color: #555; font-size: 16px;">Hello,</p>
                <p style="color: #555; font-size: 16px;">Your verification code for Mark Morph is:</p>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${otp}</span>
                </div>
                <p style="color: #555; font-size: 14px;">This code will expire in 10 minutes.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">If you didn't request this code, please ignore this email.</p>
            </div>
        `;

        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: this.fromEmail,
                    to: email,
                    subject,
                    html,
                });
                this.logger.log(`✅ OTP taken flight to ${email}`);
                return true;
            } catch (error) {
                this.logger.error(`❌ Failed to send email to ${email}: ${error.message}`);
                return false;
            }
        } else {
            // Mock Mode
            this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject} | OTP: ${otp}`);
            return true;
        }
    }
}
