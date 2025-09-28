import crypto from 'crypto';
import { sendEmail } from './email-service';
import { SecretsManager } from '@/lib/security/secrets-manager';

/**
 * Two-Factor Authentication Service
 * Implements email and TOTP-based 2FA
 */

export interface TOTPSecret {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorSetup {
  totp: TOTPSecret;
  email: boolean;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  method: 'totp' | 'email' | 'backup';
  code: string;
  userId: string;
}

export class TwoFactorAuthService {
  private static readonly TOTP_ISSUER = 'AI Finance Tracker';
  private static readonly TOTP_ALGORITHM = 'sha1';
  private static readonly TOTP_DIGITS = 6;
  private static readonly TOTP_PERIOD = 30;

  /**
   * Generate TOTP secret for user
   */
  static generateTOTPSecret(userId: string, userEmail: string): TOTPSecret {
    const secret = crypto.randomBytes(20).toString('base64');
    const qrCodeUrl = this.generateQRCodeUrl(userId, userEmail, secret);
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Generate QR code URL for TOTP setup
   */
  private static generateQRCodeUrl(
    userId: string,
    userEmail: string,
    secret: string
  ): string {
    const issuer = encodeURIComponent(this.TOTP_ISSUER);
    const account = encodeURIComponent(`${userEmail} (${userId})`);
    const secretParam = encodeURIComponent(secret);

    return `otpauth://totp/${issuer}:${account}?secret=${secretParam}&issuer=${issuer}&algorithm=${this.TOTP_ALGORITHM}&digits=${this.TOTP_DIGITS}&period=${this.TOTP_PERIOD}`;
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Verify TOTP code
   */
  static verifyTOTPCode(secret: string, code: string): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(currentTime / this.TOTP_PERIOD);

    // Check current and previous time steps (allow for clock drift)
    for (let i = -1; i <= 1; i++) {
      const testTime = timeStep + i;
      const expectedCode = this.generateTOTPCode(secret, testTime);
      if (expectedCode === code) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate TOTP code for specific time
   */
  private static generateTOTPCode(secret: string, time: number): string {
    const key = Buffer.from(secret, 'base64');
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(time, 4);

    const hmac = crypto.createHmac(this.TOTP_ALGORITHM, key);
    hmac.update(timeBuffer);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0xf;
    const code =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    return (code % Math.pow(10, this.TOTP_DIGITS))
      .toString()
      .padStart(this.TOTP_DIGITS, '0');
  }

  /**
   * Generate email verification code
   */
  static generateEmailCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send email verification code
   */
  static async sendEmailCode(
    userEmail: string,
    code: string
  ): Promise<boolean> {
    try {
      await sendEmail({
        to: userEmail,
        subject: 'Your AI Finance Tracker Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Two-Factor Authentication</h2>
            <p>Your verification code is:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">
              This is an automated message from AI Finance Tracker. Please do not reply to this email.
            </p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email code:', error);
      return false;
    }
  }

  /**
   * Verify email code
   */
  static async verifyEmailCode(
    userId: string,
    code: string,
    storedCode: string,
    codeExpiry: Date
  ): Promise<boolean> {
    if (new Date() > codeExpiry) {
      return false; // Code expired
    }

    return code === storedCode;
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(
    userId: string,
    code: string,
    storedCodes: string[]
  ): Promise<boolean> {
    const index = storedCodes.findIndex(storedCode => storedCode === code);
    if (index === -1) {
      return false; // Invalid backup code
    }

    // Remove used backup code
    storedCodes.splice(index, 1);

    // Update user's backup codes in database
    await this.updateUserBackupCodes(userId, storedCodes);

    return true;
  }

  /**
   * Setup 2FA for user
   */
  static async setupTwoFactor(
    userId: string,
    userEmail: string
  ): Promise<TwoFactorSetup> {
    const totp = this.generateTOTPSecret(userId, userEmail);
    const backupCodes = this.generateBackupCodes();

    // Store 2FA setup in database
    await this.storeTwoFactorSetup(userId, {
      totpSecret: totp.secret,
      backupCodes,
      emailEnabled: true,
      totpEnabled: false, // Will be enabled after verification
    });

    return {
      totp,
      email: true,
      backupCodes,
    };
  }

  /**
   * Enable 2FA after verification
   */
  static async enableTwoFactor(
    userId: string,
    method: 'totp' | 'email'
  ): Promise<boolean> {
    try {
      await this.updateTwoFactorStatus(userId, method, true);
      return true;
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      return false;
    }
  }

  /**
   * Disable 2FA
   */
  static async disableTwoFactor(userId: string): Promise<boolean> {
    try {
      await this.updateTwoFactorStatus(userId, 'totp', false);
      await this.updateTwoFactorStatus(userId, 'email', false);
      return true;
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      return false;
    }
  }

  /**
   * Verify 2FA code
   */
  static async verifyTwoFactor(
    userId: string,
    verification: TwoFactorVerification
  ): Promise<boolean> {
    try {
      const user2FA = await this.getUserTwoFactorSettings(userId);
      if (!user2FA) {
        return false;
      }

      switch (verification.method) {
        case 'totp':
          if (!user2FA.totpEnabled || !user2FA.totpSecret) {
            return false;
          }
          return this.verifyTOTPCode(user2FA.totpSecret, verification.code);

        case 'email':
          if (!user2FA.emailEnabled) {
            return false;
          }
          return await this.verifyEmailCode(
            userId,
            verification.code,
            user2FA.emailCode || '',
            user2FA.emailCodeExpiry || new Date()
          );

        case 'backup':
          if (!user2FA.backupCodes || user2FA.backupCodes.length === 0) {
            return false;
          }
          return await this.verifyBackupCode(
            userId,
            verification.code,
            user2FA.backupCodes
          );

        default:
          return false;
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
      return false;
    }
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const newCodes = this.generateBackupCodes();
    await this.updateUserBackupCodes(userId, newCodes);
    return newCodes;
  }

  /**
   * Check if user has 2FA enabled
   */
  static async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user2FA = await this.getUserTwoFactorSettings(userId);
    return !!(user2FA?.totpEnabled || user2FA?.emailEnabled);
  }

  /**
   * Get user's 2FA methods
   */
  static async getTwoFactorMethods(userId: string): Promise<{
    totp: boolean;
    email: boolean;
    backupCodes: number;
  }> {
    const user2FA = await this.getUserTwoFactorSettings(userId);
    return {
      totp: user2FA?.totpEnabled || false,
      email: user2FA?.emailEnabled || false,
      backupCodes: user2FA?.backupCodes?.length || 0,
    };
  }

  // Database operations (mock implementations)

  private static async storeTwoFactorSetup(
    userId: string,
    setup: {
      totpSecret: string;
      backupCodes: string[];
      emailEnabled: boolean;
      totpEnabled: boolean;
    }
  ): Promise<void> {
    // In a real implementation, store in database
    console.log(`[2FA] Stored setup for user ${userId}`);
  }

  private static async updateTwoFactorStatus(
    userId: string,
    method: 'totp' | 'email',
    enabled: boolean
  ): Promise<void> {
    // In a real implementation, update database
    console.log(
      `[2FA] Updated ${method} status for user ${userId}: ${enabled}`
    );
  }

  private static async updateUserBackupCodes(
    userId: string,
    codes: string[]
  ): Promise<void> {
    // In a real implementation, update database
    console.log(`[2FA] Updated backup codes for user ${userId}`);
  }

  private static async getUserTwoFactorSettings(userId: string): Promise<{
    totpEnabled: boolean;
    emailEnabled: boolean;
    totpSecret?: string;
    backupCodes?: string[];
    emailCode?: string;
    emailCodeExpiry?: Date;
  } | null> {
    // In a real implementation, fetch from database
    return {
      totpEnabled: false,
      emailEnabled: false,
      backupCodes: [],
    };
  }
}
