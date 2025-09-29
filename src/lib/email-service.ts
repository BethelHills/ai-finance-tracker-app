import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter | null = null;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    // For development, use a test account or Gmail
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      // Use Gmail for development (you'll need to set up app password)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASSWORD || 'your-app-password',
        },
      });
    } else {
      // For production, use your preferred email service
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    return this.transporter;
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
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);

      return { success: true };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: 'Failed to send email. Please try again.',
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
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-number { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
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
                <p style="margin: 10px 0 0 0; color: #666;">This code expires in 5 minutes</p>
              </div>
              
              <p><strong>Important Security Information:</strong></p>
              <ul>
                <li>This code is valid for 5 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
              
              <p>If you're having trouble, you can copy and paste this code: <strong>${otp}</strong></p>
              
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

Important Security Information:
- This code is valid for 5 minutes only
- Do not share this code with anyone
- If you didn't request this code, please ignore this email

If you're having trouble, you can copy and paste this code: ${otp}

This email was sent by AI Finance Tracker
If you didn't request this verification, please ignore this email.
    `;
  }
}

export const emailService = EmailService.getInstance();
