import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export type OtpPurpose = 'admin_login' | 'wifi_access' | 'business_auth';

interface OtpEmailData {
    email: string;
    otp: string;
    purpose: OtpPurpose;
    businessName?: string;  // For WiFi access emails
    expiryMinutes?: number;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter | null = null;
    private readonly DEFAULT_EXPIRY_MINUTES = 10;

    constructor(private configService: ConfigService) {
        this.initializeTransporter();
    }

    private initializeTransporter(): void {
        const host = this.configService.get<string>('EMAIL_HOST');
        const port = this.configService.get<number>('EMAIL_PORT') || 465;
        const user = this.configService.get<string>('EMAIL_USER');
        const pass = this.configService.get<string>('EMAIL_PASS');

        this.logger.log(`📧 Email config check - Host: ${host ? 'SET' : 'MISSING'}, User: ${user ? 'SET' : 'MISSING'}, Pass: ${pass ? 'SET' : 'MISSING'}, Port: ${port}`);

        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: true, // Use SSL
                auth: { user, pass },
                connectionTimeout: 10000, // 10 seconds
                greetingTimeout: 10000,
                socketTimeout: 15000,
            });
            this.logger.log(`📧 Email service configured with host: ${host}, user: ${user}, port: ${port}, secure: true`);
        } else {
            this.logger.warn('⚠️ Email credentials not found. Using MOCK email service.');
            this.logger.warn(`   Missing: ${!host ? 'EMAIL_HOST ' : ''}${!user ? 'EMAIL_USER ' : ''}${!pass ? 'EMAIL_PASS' : ''}`);
        }
    }

    /**
     * Send OTP email based on purpose
     */
    async sendOtpEmail(data: OtpEmailData): Promise<void> {
        const { email, otp, purpose, businessName, expiryMinutes = this.DEFAULT_EXPIRY_MINUTES } = data;

        const template = this.getEmailTemplate(purpose, otp, expiryMinutes, businessName);

        if (this.transporter) {
            try {
                const fromEmail = this.configService.get<string>('EMAIL_FROM') ||
                    this.configService.get<string>('EMAIL_USER');

                this.logger.log(`📧 Sending ${purpose} OTP to: ${email}`);

                const info = await this.transporter.sendMail({
                    from: `"MarkMorph" <${fromEmail}>`,
                    to: email,
                    subject: template.subject,
                    html: template.html,
                });

                this.logger.log(`✅ ${purpose} OTP email sent to ${email} | MessageId: ${info.messageId}`);
            } catch (error) {
                this.logger.error(`❌ Failed to send ${purpose} OTP email to ${email}`);
                this.logger.error(`   Error name: ${error.name}`);
                this.logger.error(`   Error message: ${error.message}`);
                this.logger.error(`   Error code: ${error.code || 'N/A'}`);
                this.logger.error(`   Full error: ${JSON.stringify(error, null, 2)}`);
                throw new Error(`Failed to send verification code. Please try again.`);
            }
        } else {
            // Mock mode for development
            this.logger.warn(`⚠️ [MOCK EMAIL] Transporter not configured`);
            this.logger.log(`📧 [MOCK EMAIL] Purpose: ${purpose} | To: ${email} | OTP: ${otp}`);
        }
    }

    /**
     * Get email template based on purpose
     */
    private getEmailTemplate(
        purpose: OtpPurpose,
        otp: string,
        expiryMinutes: number,
        businessName?: string
    ): { subject: string; html: string } {
        const baseStyles = `
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        `;

        const otpBoxStyle = `
            background: linear-gradient(135deg, #f6f8fb 0%, #f1f3f6 100%);
            padding: 25px;
            text-align: center;
            border-radius: 12px;
            border: 2px dashed #e0e0e0;
            margin: 0 0 30px;
        `;

        const otpCodeStyle = `
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        `;

        const warningBoxStyle = `
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 0 0 25px;
        `;

        switch (purpose) {
            case 'admin_login':
                return {
                    subject: '🔐 MarkMorph Admin Login Code',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="${baseStyles}">
                            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                                <h1 style="color: #f39c12; margin: 0; font-size: 24px;">🔐 Admin Access</h1>
                                <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">MarkMorph Admin Panel</p>
                            </div>
                            
                            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hello Admin,</p>
                                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                                    You have requested access to the <strong>MarkMorph Admin Panel</strong>. Use the code below to complete your login:
                                </p>
                                
                                <div style="${otpBoxStyle}">
                                    <span style="${otpCodeStyle} color: #f39c12;">${otp}</span>
                                </div>
                                
                                <div style="${warningBoxStyle}">
                                    <p style="color: #856404; font-size: 14px; margin: 0;">
                                        🔒 <strong>Security Notice:</strong> This code expires in <strong>${expiryMinutes} minutes</strong>. 
                                        Never share this code with anyone.
                                    </p>
                                </div>
                                
                                <p style="color: #888; font-size: 13px; margin: 0; text-align: center;">
                                    If you didn't request this code, please secure your account immediately.
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 20px;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    <span style="color: #f39c12; font-weight: 600;">MarkMorph</span> Admin Portal
                                </p>
                            </div>
                        </body>
                        </html>
                    `,
                };

            case 'wifi_access':
                return {
                    subject: `📶 Your WiFi Access Code - ${businessName || 'MarkMorph'}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="${baseStyles}">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">📶 WiFi Access Code</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">for ${businessName || 'MarkMorph WiFi'}</p>
                            </div>
                            
                            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hello,</p>
                                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                                    Use the verification code below to connect to the WiFi network at <strong>${businessName || 'this location'}</strong>:
                                </p>
                                
                                <div style="${otpBoxStyle}">
                                    <span style="${otpCodeStyle} color: #667eea;">${otp}</span>
                                </div>
                                
                                <div style="${warningBoxStyle}">
                                    <p style="color: #856404; font-size: 14px; margin: 0;">
                                        ⏱️ This code expires in <strong>${expiryMinutes} minutes</strong>
                                    </p>
                                </div>
                                
                                <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin: 0 0 25px;">
                                    <p style="color: #2e7d32; font-size: 14px; margin: 0; text-align: center;">
                                        🎉 Enjoy free WiFi at ${businessName || 'this location'}!
                                    </p>
                                </div>
                                
                                <p style="color: #888; font-size: 13px; margin: 0; text-align: center;">
                                    If you didn't request this code, please ignore this email.
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 20px;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    Powered by <span style="color: #667eea; font-weight: 600;">MarkMorph</span>
                                </p>
                            </div>
                        </body>
                        </html>
                    `,
                };

            case 'business_auth':
                return {
                    subject: '🏢 MarkMorph Business Verification Code',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="${baseStyles}">
                            <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">🏢 Business Verification</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">MarkMorph for Business</p>
                            </div>
                            
                            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hello Business Owner,</p>
                                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                                    You're one step away from accessing your <strong>MarkMorph Business Dashboard</strong>. 
                                    Enter the verification code below to continue:
                                </p>
                                
                                <div style="${otpBoxStyle}">
                                    <span style="${otpCodeStyle} color: #11998e;">${otp}</span>
                                </div>
                                
                                <div style="${warningBoxStyle}">
                                    <p style="color: #856404; font-size: 14px; margin: 0;">
                                        ⏱️ This code expires in <strong>${expiryMinutes} minutes</strong>
                                    </p>
                                </div>
                                
                                <div style="background: #f0f9ff; border-radius: 8px; padding: 15px; margin: 0 0 25px;">
                                    <p style="color: #0369a1; font-size: 14px; margin: 0;">
                                        💡 <strong>Tip:</strong> Manage your WiFi portal, ads, and analytics from your dashboard!
                                    </p>
                                </div>
                                
                                <p style="color: #888; font-size: 13px; margin: 0; text-align: center;">
                                    If you didn't request this code, please ignore this email or contact support.
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 20px;">
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    <span style="color: #11998e; font-weight: 600;">MarkMorph</span> for Business
                                </p>
                            </div>
                        </body>
                        </html>
                    `,
                };

            default:
                throw new Error(`Unknown OTP purpose: ${purpose}`);
        }
    }

    /**
     * Verify transporter is working
     */
    async verifyConnection(): Promise<boolean> {
        if (!this.transporter) {
            return false;
        }

        try {
            await this.transporter.verify();
            this.logger.log('✅ Email transporter connection verified');
            return true;
        } catch (error) {
            this.logger.error(`❌ Email transporter verification failed: ${error.message}`);
            return false;
        }
    }
}
