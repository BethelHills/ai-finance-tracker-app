import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class FastEmailService {
  private static instance: FastEmailService;
  private transporter: nodemailer.Transporter | null = null;

  static getInstance(): FastEmailService {
    if (!FastEmailService.instance) {
      FastEmailService.instance = new FastEmailService();
    }
    return FastEmailService.instance;
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    // Use multiple fallback options for faster, more reliable email sending
    const emailConfigs = [
      // Option 1: Gmail with optimized settings
      {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 8000,
        greetingTimeout: 3000,
        socketTimeout: 8000,
      },
      // Option 2: Generic SMTP with TLS
      {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 8000,
        greetingTimeout: 3000,
        socketTimeout: 8000,
      },
      // Option 3: Generic SMTP with SSL
      {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 8000,
        greetingTimeout: 3000,
        socketTimeout: 8000,
      },
    ];

    // Try each configuration until one works
    for (const config of emailConfigs) {
      try {
        console.log('🔧 Trying email configuration...');
        this.transporter = nodemailer.createTransporter(config);
        
        // Test the connection
        await this.transporter.verify();
        console.log('✅ Email transporter verified successfully');
        return this.transporter;
      } catch (error) {
        console.log('❌ Email config failed, trying next...');
        continue;
      }
    }

    throw new Error('All email configurations failed');
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          'AI Finance Tracker <noreply@aifinancetracker.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        priority: 'high',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
        },
      };

      console.log('📧 Sending email to:', options.to);
      const startTime = Date.now();

      // Set a strict timeout of 10 seconds
      const result = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email timeout after 10 seconds')), 10000)
        )
      ]) as any;

      const duration = Date.now() - startTime;
      console.log(`📧 Email sent successfully in ${duration}ms:`, result.messageId);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Fast email sending failed:', error.message || error);
      
      if (error.message?.includes('timeout')) {
        return {
          success: false,
          error: 'Email sending timed out. Please try again.',
        };
      }
      
      return {
        success: false,
        error: 'Failed to send email. Please check your email configuration.',
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
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .otp-code { background: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-number { font-size: 28px; font-weight: bold; color: #667eea; letter-spacing: 3px; font-family: monospace; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 AI Finance Tracker</h1>
              <p>Secure Financial Management</p>
            </div>
            <div class="content">
              <h2>Email Verification Required</h2>
              <p>Hello!</p>
              <p>To ${action}, please use the verification code below:</p>
              
              <div class="otp-code">
                <div class="otp-number">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">This code expires in 5 minutes</p>
              </div>
              
              <p><strong>Security Information:</strong></p>
              <ul>
                <li>This code is valid for 5 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
              
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

This email was sent by AI Finance Tracker
If you didn't request this verification, please ignore this email.
    `;
  }
}

export const fastEmailService = FastEmailService.getInstance();
