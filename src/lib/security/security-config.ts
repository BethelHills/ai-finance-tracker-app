import { SecretsManager } from './secrets-manager';
import { AccessControlService } from './access-control';

/**
 * Security Configuration Service
 * Centralized security settings and validation
 */

export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keyLength: number;
    fieldLevelEncryption: boolean;
    tlsVersion: string;
  };
  authentication: {
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number; // days
    };
  };
  authorization: {
    rbacEnabled: boolean;
    leastPrivilege: boolean;
    auditAllAccess: boolean;
  };
  compliance: {
    pciDssCompliant: boolean;
    gdprCompliant: boolean;
    soxCompliant: boolean;
    auditRetentionDays: number;
  };
  monitoring: {
    logAllEvents: boolean;
    alertOnSuspiciousActivity: boolean;
    realTimeMonitoring: boolean;
  };
}

export class SecurityConfigService {
  private static config: SecurityConfig = {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyLength: 256,
      fieldLevelEncryption: true,
      tlsVersion: 'TLS 1.3',
    },
    authentication: {
      sessionTimeout: 30, // 30 minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15, // 15 minutes
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // 90 days
      },
    },
    authorization: {
      rbacEnabled: true,
      leastPrivilege: true,
      auditAllAccess: true,
    },
    compliance: {
      pciDssCompliant: true,
      gdprCompliant: true,
      soxCompliant: true,
      auditRetentionDays: 2555, // 7 years
    },
    monitoring: {
      logAllEvents: true,
      alertOnSuspiciousActivity: true,
      realTimeMonitoring: true,
    },
  };

  /**
   * Get current security configuration
   */
  static getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Update security configuration
   */
  static async updateConfig(
    updates: Partial<SecurityConfig>,
    updatedBy: string
  ): Promise<void> {
    // Validate configuration
    const validation = this.validateConfig({ ...this.config, ...updates });
    if (!validation.valid) {
      throw new Error(`Invalid security configuration: ${validation.errors.join(', ')}`);
    }

    // Update configuration
    this.config = { ...this.config, ...updates };

    // Log configuration change
    console.log(`[SECURITY] Configuration updated by ${updatedBy}`);
  }

  /**
   * Validate security configuration
   */
  static validateConfig(config: SecurityConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Encryption validation
    if (config.encryption.keyLength < 256) {
      errors.push('Encryption key length must be at least 256 bits');
    }

    if (!config.encryption.fieldLevelEncryption) {
      warnings.push('Field-level encryption is disabled - sensitive data may be at risk');
    }

    // Authentication validation
    if (config.authentication.sessionTimeout < 15) {
      warnings.push('Session timeout is very short - may impact user experience');
    }

    if (config.authentication.maxLoginAttempts > 10) {
      warnings.push('High number of login attempts allowed - consider reducing for security');
    }

    if (config.authentication.passwordPolicy.minLength < 8) {
      errors.push('Password minimum length must be at least 8 characters');
    }

    // Authorization validation
    if (!config.authorization.rbacEnabled) {
      warnings.push('RBAC is disabled - access control may be insufficient');
    }

    if (!config.authorization.leastPrivilege) {
      warnings.push('Least privilege principle is disabled - users may have excessive permissions');
    }

    // Compliance validation
    if (config.compliance.auditRetentionDays < 2555) {
      warnings.push('Audit retention period is less than 7 years - may not meet compliance requirements');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Perform security audit
   */
  static async performSecurityAudit(): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
    compliance: {
      pciDss: boolean;
      gdpr: boolean;
      sox: boolean;
    };
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check secrets management
    const secretsValidation = SecretsManager.validateSecrets();
    if (!secretsValidation.valid) {
      issues.push(`Missing required secrets: ${secretsValidation.missing.join(', ')}`);
      score -= 20;
    }

    if (secretsValidation.warnings.length > 0) {
      issues.push(`Secret warnings: ${secretsValidation.warnings.join(', ')}`);
      score -= 10;
    }

    // Check access control
    const accessControlReport = await AccessControlService.getAccessControlReport();
    if (accessControlReport.highPrivilegeUsers > 10) {
      issues.push(`Too many high-privilege users: ${accessControlReport.highPrivilegeUsers}`);
      score -= 15;
    }

    // Check encryption
    if (!this.config.encryption.fieldLevelEncryption) {
      issues.push('Field-level encryption is disabled');
      score -= 25;
    }

    // Check password policy
    if (this.config.authentication.passwordPolicy.minLength < 12) {
      issues.push('Password policy is too weak');
      score -= 15;
    }

    // Check session management
    if (this.config.authentication.sessionTimeout > 60) {
      issues.push('Session timeout is too long');
      score -= 10;
    }

    // Generate recommendations
    if (score < 80) {
      recommendations.push('Implement stronger password policies');
    }

    if (score < 70) {
      recommendations.push('Enable field-level encryption for all sensitive data');
    }

    if (score < 60) {
      recommendations.push('Review and reduce high-privilege user accounts');
    }

    if (score < 50) {
      recommendations.push('Implement comprehensive security monitoring');
    }

    // Check compliance
    const compliance = {
      pciDss: this.checkPCIDSSCompliance(),
      gdpr: this.checkGDPRCompliance(),
      sox: this.checkSOXCompliance(),
    };

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      compliance,
    };
  }

  /**
   * Generate security report
   */
  static async generateSecurityReport(): Promise<{
    timestamp: Date;
    config: SecurityConfig;
    audit: any;
    recommendations: string[];
  }> {
    const audit = await this.performSecurityAudit();
    
    const recommendations = [
      'Regularly rotate encryption keys',
      'Implement multi-factor authentication',
      'Conduct regular security training',
      'Perform quarterly security audits',
      'Monitor access patterns for anomalies',
      'Keep all dependencies updated',
      'Implement automated security scanning',
    ];

    return {
      timestamp: new Date(),
      config: this.config,
      audit,
      recommendations,
    };
  }

  /**
   * Check PCI DSS compliance
   */
  private static checkPCIDSSCompliance(): boolean {
    return (
      this.config.encryption.keyLength >= 256 &&
      this.config.encryption.fieldLevelEncryption &&
      this.config.compliance.pciDssCompliant &&
      this.config.monitoring.logAllEvents
    );
  }

  /**
   * Check GDPR compliance
   */
  private static checkGDPRCompliance(): boolean {
    return (
      this.config.compliance.gdprCompliant &&
      this.config.encryption.fieldLevelEncryption &&
      this.config.compliance.auditRetentionDays >= 2555
    );
  }

  /**
   * Check SOX compliance
   */
  private static checkSOXCompliance(): boolean {
    return (
      this.config.compliance.soxCompliant &&
      this.config.authorization.auditAllAccess &&
      this.config.compliance.auditRetentionDays >= 2555
    );
  }

  /**
   * Get security best practices
   */
  static getSecurityBestPractices(): string[] {
    return [
      'Never store raw card data - use tokenization',
      'Encrypt all PII at rest using AES-256',
      'Use TLS 1.3 for all data in transit',
      'Implement least privilege access control',
      'Enable comprehensive audit logging',
      'Regularly rotate encryption keys',
      'Implement multi-factor authentication',
      'Conduct regular security assessments',
      'Monitor for suspicious activity',
      'Keep all software dependencies updated',
      'Use secure coding practices',
      'Implement proper error handling',
      'Validate all input data',
      'Use parameterized queries to prevent SQL injection',
      'Implement rate limiting on APIs',
      'Use secure session management',
      'Implement proper CORS policies',
      'Use security headers (HSTS, CSP, etc.)',
      'Regularly backup and test recovery procedures',
      'Implement incident response procedures',
    ];
  }

  /**
   * Initialize security configuration
   */
  static async initialize(): Promise<void> {
    // Initialize access control roles
    AccessControlService.initializeRoles();

    // Validate current configuration
    const validation = this.validateConfig(this.config);
    if (!validation.valid) {
      throw new Error(`Security configuration validation failed: ${validation.errors.join(', ')}`);
    }

    console.log('[SECURITY] Security configuration initialized successfully');
  }
}
