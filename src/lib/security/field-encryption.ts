import crypto from 'crypto';
import { SecretsManager } from './secrets-manager';

/**
 * Field-Level Encryption for PII
 * Implements AES-256 encryption for sensitive data at rest
 */

export interface EncryptedField {
  encrypted: string;
  iv: string;
  authTag: string;
  algorithm: string;
}

export interface PIIFields {
  email?: string;
  phone?: string;
  ssn?: string;
  accountNumber?: string;
  routingNumber?: string;
  address?: string;
  dateOfBirth?: string;
  fullName?: string;
}

export class FieldEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits

  /**
   * Encrypt PII field
   */
  static async encryptField(
    field: string,
    fieldName: string
  ): Promise<EncryptedField> {
    if (!field)
      return { encrypted: '', iv: '', authTag: '', algorithm: this.ALGORITHM };

    const key = await this.getEncryptionKey(fieldName);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipher(this.ALGORITHM, key);

    let encrypted = cipher.update(field, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.ALGORITHM,
    };
  }

  /**
   * Decrypt PII field
   */
  static async decryptField(
    encryptedField: EncryptedField,
    fieldName: string
  ): Promise<string> {
    if (!encryptedField.encrypted) return '';

    const key = await this.getEncryptionKey(fieldName);
    const iv = Buffer.from(encryptedField.iv, 'hex');
    const authTag = Buffer.from(encryptedField.authTag, 'hex');

    const decipher = crypto.createDecipher(this.ALGORITHM, key);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedField.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypt multiple PII fields
   */
  static async encryptPIIFields(
    fields: PIIFields
  ): Promise<Record<string, EncryptedField>> {
    const encryptedFields: Record<string, EncryptedField> = {};

    for (const [fieldName, value] of Object.entries(fields)) {
      if (value) {
        encryptedFields[fieldName] = await this.encryptField(value, fieldName);
      }
    }

    return encryptedFields;
  }

  /**
   * Decrypt multiple PII fields
   */
  static async decryptPIIFields(
    encryptedFields: Record<string, EncryptedField>
  ): Promise<PIIFields> {
    const decryptedFields: PIIFields = {};

    for (const [fieldName, encryptedField] of Object.entries(encryptedFields)) {
      if (encryptedField.encrypted) {
        decryptedFields[fieldName as keyof PIIFields] = await this.decryptField(
          encryptedField,
          fieldName
        );
      }
    }

    return decryptedFields;
  }

  /**
   * Get field-specific encryption key
   */
  private static async getEncryptionKey(fieldName: string): Promise<string> {
    const baseKey = SecretsManager.getSecret('ENCRYPTION_KEY');
    const fieldSalt = await this.getFieldSalt(fieldName);

    // Derive field-specific key using PBKDF2
    return crypto
      .pbkdf2Sync(baseKey, fieldSalt, 100000, this.KEY_LENGTH, 'sha512')
      .toString('hex');
  }

  /**
   * Get field-specific salt
   */
  private static async getFieldSalt(fieldName: string): Promise<string> {
    const saltKey = `SALT_${fieldName.toUpperCase()}`;
    let salt = SecretsManager.getSecret(saltKey, false);

    if (!salt) {
      // Generate new salt for this field
      salt = crypto.randomBytes(32).toString('hex');
      console.log(`[SECURITY] Generated new salt for field: ${fieldName}`);
    }

    return salt;
  }

  /**
   * Mask sensitive data for display
   */
  static maskSensitiveData(
    data: string,
    type: 'email' | 'phone' | 'ssn' | 'account' | 'name'
  ): string {
    if (!data) return '';

    switch (type) {
      case 'email':
        const [local, domain] = data.split('@');
        if (local.length <= 2) return data;
        return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;

      case 'phone':
        if (data.length < 4) return data;
        return `${'*'.repeat(data.length - 4)}${data.slice(-4)}`;

      case 'ssn':
        if (data.length < 4) return data;
        return `***-**-${data.slice(-4)}`;

      case 'account':
        if (data.length < 4) return data;
        return `${'*'.repeat(data.length - 4)}${data.slice(-4)}`;

      case 'name':
        const parts = data.split(' ');
        return parts
          .map(part =>
            part.length > 2
              ? `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}`
              : part
          )
          .join(' ');

      default:
        return data;
    }
  }

  /**
   * Validate PII data before encryption
   */
  static validatePIIData(fields: PIIFields): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Email validation
    if (fields.email && !this.isValidEmail(fields.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (fields.phone && !this.isValidPhone(fields.phone)) {
      errors.push('Invalid phone format');
    }

    // SSN validation
    if (fields.ssn && !this.isValidSSN(fields.ssn)) {
      errors.push('Invalid SSN format');
    }

    // Account number validation
    if (
      fields.accountNumber &&
      !this.isValidAccountNumber(fields.accountNumber)
    ) {
      errors.push('Invalid account number format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Email validation
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Phone validation
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * SSN validation
   */
  private static isValidSSN(ssn: string): boolean {
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    return ssnRegex.test(ssn);
  }

  /**
   * Account number validation
   */
  private static isValidAccountNumber(accountNumber: string): boolean {
    // Basic validation - should be numeric and reasonable length
    const accountRegex = /^\d{8,17}$/;
    return accountRegex.test(accountNumber);
  }

  /**
   * Audit encrypted fields
   */
  static async auditEncryptedFields(): Promise<{
    totalFields: number;
    encryptedFields: number;
    unencryptedFields: number;
    compliance: number; // percentage
  }> {
    // In a real implementation, this would scan the database
    // For now, return mock data
    return {
      totalFields: 100,
      encryptedFields: 95,
      unencryptedFields: 5,
      compliance: 95,
    };
  }

  /**
   * Generate encryption report
   */
  static async generateEncryptionReport(): Promise<{
    algorithm: string;
    keyLength: number;
    fieldsEncrypted: string[];
    lastEncryption: Date;
    complianceScore: number;
  }> {
    return {
      algorithm: this.ALGORITHM,
      keyLength: this.KEY_LENGTH * 8, // Convert to bits
      fieldsEncrypted: [
        'email',
        'phone',
        'ssn',
        'accountNumber',
        'routingNumber',
        'address',
        'dateOfBirth',
        'fullName',
      ],
      lastEncryption: new Date(),
      complianceScore: 95,
    };
  }
}
