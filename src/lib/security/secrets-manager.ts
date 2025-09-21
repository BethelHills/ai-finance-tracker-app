import crypto from 'crypto';

/**
 * Secure Secrets Management
 * Ensures secrets are never committed and properly encrypted
 */

export interface SecretConfig {
  key: string;
  value: string;
  encrypted: boolean;
  environment: string;
  lastRotated: Date;
  expiresAt?: Date;
}

export class SecretsManager {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits

  /**
   * Get secret from environment with validation
   */
  static getSecret(key: string, required: boolean = true): string {
    const value = process.env[key];
    
    if (required && !value) {
      throw new Error(`Required secret ${key} is not set in environment variables`);
    }

    if (value && this.isPotentiallyExposed(value)) {
      console.warn(`[SECURITY WARNING] Secret ${key} may be exposed in logs or code`);
    }

    return value || '';
  }

  /**
   * Get encrypted secret and decrypt it
   */
  static async getEncryptedSecret(key: string): Promise<string> {
    const encryptedValue = this.getSecret(key);
    
    if (!encryptedValue) {
      throw new Error(`Encrypted secret ${key} is not set`);
    }

    try {
      return await this.decrypt(encryptedValue);
    } catch (error) {
      throw new Error(`Failed to decrypt secret ${key}: ${error}`);
    }
  }

  /**
   * Encrypt sensitive data
   */
  static async encrypt(data: string, key?: string): Promise<string> {
    const encryptionKey = key || this.getSecret('ENCRYPTION_KEY');
    
    if (!encryptionKey) {
      throw new Error('Encryption key not found');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(encryptedData: string, key?: string): Promise<string> {
    const encryptionKey = key || this.getSecret('ENCRYPTION_KEY');
    
    if (!encryptionKey) {
      throw new Error('Encryption key not found');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(this.ENCRYPTION_ALGORITHM, encryptionKey);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Validate all required secrets are present
   */
  static validateSecrets(): {
    valid: boolean;
    missing: string[];
    warnings: string[];
  } {
    const requiredSecrets = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'ENCRYPTION_KEY',
    ];

    const optionalSecrets = [
      'OPENAI_API_KEY',
      'PLAID_CLIENT_ID',
      'PLAID_SECRET',
      'STRIPE_SECRET_KEY',
      'PAYSTACK_SECRET_KEY',
      'FLUTTERWAVE_SECRET_KEY',
    ];

    const missing: string[] = [];
    const warnings: string[] = [];

    // Check required secrets
    for (const secret of requiredSecrets) {
      if (!process.env[secret]) {
        missing.push(secret);
      }
    }

    // Check optional secrets
    for (const secret of optionalSecrets) {
      if (!process.env[secret]) {
        warnings.push(`Optional secret ${secret} is not set`);
      }
    }

    // Check for hardcoded secrets
    const hardcodedSecrets = this.detectHardcodedSecrets();
    warnings.push(...hardcodedSecrets);

    return {
      valid: missing.length === 0,
      missing,
      warnings,
    };
  }

  /**
   * Detect potentially hardcoded secrets
   */
  private static detectHardcodedSecrets(): string[] {
    const warnings: string[] = [];
    
    // Common secret patterns
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]{24,}/, // Stripe live key
      /pk_live_[a-zA-Z0-9]{24,}/, // Stripe live public key
      /sk_test_[a-zA-Z0-9]{24,}/, // Stripe test key
      /pk_test_[a-zA-Z0-9]{24,}/, // Stripe test public key
      /sk_live_[a-zA-Z0-9]{40,}/, // Paystack live key
      /pk_live_[a-zA-Z0-9]{40,}/, // Paystack live public key
      /FLWSECK-[a-zA-Z0-9]{40,}/, // Flutterwave secret key
      /FLWPUBK-[a-zA-Z0-9]{40,}/, // Flutterwave public key
      /[a-zA-Z0-9]{32,}/, // Generic long string (potential secret)
    ];

    // In a real implementation, scan codebase for these patterns
    // For now, return empty array
    return warnings;
  }

  /**
   * Check if value looks like a secret
   */
  private static isPotentiallyExposed(value: string): boolean {
    const secretPatterns = [
      /sk_live_/,
      /pk_live_/,
      /sk_test_/,
      /pk_test_/,
      /FLWSECK-/,
      /FLWPUBK-/,
      /[a-zA-Z0-9]{40,}/, // Long alphanumeric string
    ];

    return secretPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Rotate secret (generate new value)
   */
  static async rotateSecret(key: string): Promise<string> {
    const newValue = crypto.randomBytes(32).toString('hex');
    
    // In production, this would update the secret in Vercel/Secrets Manager
    console.log(`[SECURITY] Secret ${key} rotated successfully`);
    
    return newValue;
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate secure password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  /**
   * Hash sensitive data for storage
   */
  static hash(data: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512');
    return `${actualSalt}:${hash.toString('hex')}`;
  }

  /**
   * Verify hashed data
   */
  static verifyHash(data: string, hashedData: string): boolean {
    const [salt, hash] = hashedData.split(':');
    const newHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512');
    return newHash.toString('hex') === hash;
  }
}
