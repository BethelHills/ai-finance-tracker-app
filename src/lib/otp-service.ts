// OTP Service for email verification
import { emailService } from './email-service';
import { fastEmailService } from './fast-email-service';
import { devEmailService } from './dev-email-service';

interface OTPData {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
  type: 'signup' | 'login';
}

class OTPService {
  private static instance: OTPService;
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private isExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt;
  }

  async sendOTP(
    email: string,
    type: 'signup' | 'login'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Clean up expired OTPs
      this.cleanupExpiredOTPs();

      // Check if there's already a valid OTP for this email
      const existingOTP = this.otpStorage.get(email);
      if (existingOTP && !this.isExpired(existingOTP.expiresAt)) {
        return {
          success: false,
          error: 'Please wait before requesting a new code',
        };
      }

      const otp = this.generateOTP();
      const expiresAt = Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000;

      // Store OTP data
      this.otpStorage.set(email, {
        code: otp,
        email,
        expiresAt,
        attempts: 0,
        type,
      });

      // Send OTP via email with smart fallback
      console.log(`📧 Sending OTP to ${email}: ${otp}`);
      console.log(`⏰ Expires at: ${new Date(expiresAt).toLocaleString()}`);

      // Check if email credentials are configured
      const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
      
      let emailResult;
      
      if (!hasEmailConfig) {
        // Use dev email service if no credentials configured
        console.log('🚀 Using development email service (no credentials configured)');
        emailResult = await devEmailService.sendOTPEmail(email, otp, type);
      } else {
        // Try fast email service first, then fallback to regular service
        emailResult = await fastEmailService.sendOTPEmail(email, otp, type);
        
        if (!emailResult.success) {
          console.log('🔄 Fast email failed, trying regular email service...');
          emailResult = await emailService.sendOTPEmail(email, otp, type);
        }
      }

      if (!emailResult.success) {
        // If all email services fail, still store OTP but log the error
        console.error('❌ All email services failed:', emailResult.error);
        // For development, we'll still allow the OTP to work
        // In production, you might want to return an error here
      } else {
        console.log('✅ Email sent successfully via optimized service');
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        error: 'Failed to send verification code',
      };
    }
  }

  async verifyOTP(
    email: string,
    inputCode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const otpData = this.otpStorage.get(email);

      if (!otpData) {
        return {
          success: false,
          error: 'No verification code found. Please request a new one.',
        };
      }

      if (this.isExpired(otpData.expiresAt)) {
        this.otpStorage.delete(email);
        return {
          success: false,
          error: 'Verification code has expired. Please request a new one.',
        };
      }

      if (otpData.attempts >= this.MAX_ATTEMPTS) {
        this.otpStorage.delete(email);
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new code.',
        };
      }

      if (otpData.code !== inputCode) {
        otpData.attempts++;
        this.otpStorage.set(email, otpData);

        const remainingAttempts = this.MAX_ATTEMPTS - otpData.attempts;
        return {
          success: false,
          error: `Invalid code. ${remainingAttempts} attempts remaining.`,
        };
      }

      // OTP is valid, remove it from storage
      this.otpStorage.delete(email);
      return { success: true };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: 'Verification failed. Please try again.',
      };
    }
  }

  private cleanupExpiredOTPs(): void {
    for (const [email, otpData] of this.otpStorage.entries()) {
      if (this.isExpired(otpData.expiresAt)) {
        this.otpStorage.delete(email);
      }
    }
  }

  // For development/testing purposes
  getStoredOTP(email: string): string | null {
    const otpData = this.otpStorage.get(email);
    if (otpData && !this.isExpired(otpData.expiresAt)) {
      return otpData.code;
    }
    return null;
  }

  // Clear all OTPs (for testing)
  clearAllOTPs(): void {
    this.otpStorage.clear();
  }
}

export const otpService = OTPService.getInstance();
