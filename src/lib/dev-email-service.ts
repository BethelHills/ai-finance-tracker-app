interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class DevEmailService {
  private static instance: DevEmailService;

  static getInstance(): DevEmailService {
    if (!DevEmailService.instance) {
      DevEmailService.instance = new DevEmailService();
    }
    return DevEmailService.instance;
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; error?: string }> {
    // Simulate email sending with a short delay
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
    
    console.log('📧 [DEV MODE] Email would be sent to:', options.to);
    console.log('📧 [DEV MODE] Subject:', options.subject);
    console.log('📧 [DEV MODE] OTP Code:', this.extractOTPFromHTML(options.html));
    
    // Always succeed in development mode
    return { success: true };
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

    console.log('🚀 [DEV MODE] Fast OTP email simulation');
    console.log('📧 [DEV MODE] To:', email);
    console.log('🔐 [DEV MODE] OTP Code:', otp);
    console.log('⏰ [DEV MODE] Type:', type);

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  private extractOTPFromHTML(html: string): string {
    const match = html.match(/<div class="otp-number">(\d+)<\/div>/);
    return match ? match[1] : 'Not found';
  }

  private generateOTPEmailHTML(otp: string, type: 'signup' | 'login'): string {
    const action =
      type === 'signup'
        ? 'complete your registration'
        : 'sign in to your account';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>🔐 AI Finance Tracker - Email Verification</h2>
        <p>Hello!</p>
        <p>To ${action}, please use the verification code below:</p>
        
        <div style="background: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <div style="font-size: 28px; font-weight: bold; color: #667eea; letter-spacing: 3px; font-family: monospace;">${otp}</div>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">This code expires in 5 minutes</p>
        </div>
        
        <p><strong>Security Information:</strong></p>
        <ul>
          <li>This code is valid for 5 minutes only</li>
          <li>Do not share this code with anyone</li>
          <li>If you didn't request this code, please ignore this email</li>
        </ul>
        
        <p style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          This email was sent by AI Finance Tracker (Development Mode)
        </p>
      </div>
    `;
  }

  private generateOTPEmailText(otp: string, type: 'signup' | 'login'): string {
    const action =
      type === 'signup'
        ? 'complete your registration'
        : 'sign in to your account';

    return `
AI Finance Tracker - Email Verification (Development Mode)

Hello!

To ${action}, please use the verification code below:

${otp}

This code expires in 5 minutes.

Security Information:
- This code is valid for 5 minutes only
- Do not share this code with anyone
- If you didn't request this code, please ignore this email

This email was sent by AI Finance Tracker (Development Mode)
    `;
  }
}

export const devEmailService = DevEmailService.getInstance();
