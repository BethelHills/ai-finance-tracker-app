import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class ResendEmailService {
  private static instance: ResendEmailService;
  private resend: Resend | null = null;

  static getInstance(): ResendEmailService {
    if (!ResendEmailService.instance) {
      ResendEmailService.instance = new ResendEmailService();
    }
    return ResendEmailService.instance;
  }

  private initializeResend(): void {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️ RESEND_API_KEY not configured, Resend service unavailable');
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      console.log('✅ Resend email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Resend:', error);
    }
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.resend) {
      this.initializeResend();
    }

    if (!this.resend) {
      return {
        success: false,
        error: 'Resend service not available. Please configure RESEND_API_KEY.',
      };
    }

    try {
      console.log('📧 Sending email via Resend to:', options.to);
      const startTime = Date.now();

      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'AI Finance Tracker <noreply@aifinancetracker.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      const duration = Date.now() - startTime;
      console.log(`📧 Email sent successfully via Resend in ${duration}ms:`, result.data?.id);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Resend email sending failed:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email via Resend.',
      };
    }
  }

  async sendOTPEmail(
    email: string,
    otp: string,
    type: 'signup' | 'login'
  ): Promise<{ success: boolean; error?: string }> {
    const subject =
      type === 'signup'
        ? 'Verify your email - AI Finance Tracker'
        : 'Login verification code - AI Finance Tracker';

    const html = this.generateOTPEmailHTML(otp, type);
    const text = this.generateOTPEmailText(otp, type);

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  private generateOTPEmailHTML(otp: string, type: 'signup' | 'login'): string {
    const action =
      type === 'signup'
        ? 'complete your registration'
        : 'sign in to your account';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f8fafc;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              margin: 8px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .otp-code { 
              background: #f8fafc; 
              border: 2px solid #e2e8f0; 
              border-radius: 12px; 
              padding: 30px; 
              text-align: center; 
              margin: 30px 0; 
              position: relative;
            }
            .otp-number { 
              font-size: 36px; 
              font-weight: 700; 
              color: #667eea; 
              letter-spacing: 8px; 
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              margin: 0;
            }
            .otp-label {
              color: #64748b;
              font-size: 14px;
              margin: 12px 0 0 0;
              font-weight: 500;
            }
            .security-info {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
            }
            .security-info h3 {
              margin: 0 0 8px 0;
              color: #92400e;
              font-size: 14px;
              font-weight: 600;
            }
            .security-info ul {
              margin: 0;
              padding-left: 20px;
              color: #92400e;
              font-size: 13px;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 30px;
              border-top: 1px solid #e2e8f0;
              color: #64748b; 
              font-size: 13px; 
            }
            .footer p {
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 AI Finance Tracker</h1>
              <p>Secure Financial Management</p>
            </div>
            <div class="content">
              <h2 style="margin-top: 0; color: #1e293b;">Email Verification Required</h2>
              <p>Hello!</p>
              <p>To ${action}, please use the verification code below:</p>
              
              <div class="otp-code">
                <div class="otp-number">${otp}</div>
                <p class="otp-label">This code expires in 5 minutes</p>
              </div>
              
              <div class="security-info">
                <h3>🔒 Security Information</h3>
                <ul>
                  <li>This code is valid for 5 minutes only</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">
                If you're having trouble, you can copy and paste this code: <strong>${otp}</strong>
              </p>
              
              <div class="footer">
                <p>This email was sent by AI Finance Tracker</p>
                <p>If you didn't request this verification, please ignore this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateOTPEmailText(otp: string, type: 'signup' | 'login'): string {
    const action =
      type === 'signup'
        ? 'complete your registration'
        : 'sign in to your account';

    return `
AI Finance Tracker - Email Verification

Hello!

To ${action}, please use the verification code below:

${otp}

This code expires in 5 minutes.

Security Information:
- This code is valid for 5 minutes only
- Do not share this code with anyone
- If you didn't request this code, please ignore this email

If you're having trouble, you can copy and paste this code: ${otp}

This email was sent by AI Finance Tracker
If you didn't request this verification, please ignore this email.
    `;
  }
}

export const resendEmailService = ResendEmailService.getInstance();
