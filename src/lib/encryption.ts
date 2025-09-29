import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static getKey(): string {
    // In production, this should come from environment variables
    // and be derived from user-specific data
    const baseKey =
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
      'default-key-change-in-production';
    return baseKey;
  }

  private static getDerivedKey(userId: string): string {
    // Derive a unique key for each user
    const baseKey = this.getKey();
    return CryptoJS.SHA256(baseKey + userId).toString();
  }

  static encrypt(data: string, userId: string): string {
    try {
      const key = this.getDerivedKey(userId);
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string, userId: string): string {
    try {
      const key = this.getDerivedKey(userId);
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const result = decrypted.toString(CryptoJS.enc.Utf8);

      if (!result) {
        throw new Error('Failed to decrypt data');
      }

      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static encryptSensitiveFields(
    data: any,
    userId: string,
    fieldsToEncrypt: string[]
  ): any {
    const encrypted = { ...data };

    fieldsToEncrypt.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encrypt(encrypted[field], userId);
      }
    });

    return encrypted;
  }

  static decryptSensitiveFields(
    data: any,
    userId: string,
    fieldsToDecrypt: string[]
  ): any {
    const decrypted = { ...data };

    fieldsToDecrypt.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = this.decrypt(decrypted[field], userId);
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          // Keep the encrypted value if decryption fails
        }
      }
    });

    return decrypted;
  }

  static generateSecureId(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }

  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }
}
