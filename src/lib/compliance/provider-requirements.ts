/**
 * Provider Requirements & Compliance
 * Centralized configuration for different payment providers
 */

export interface ProviderRequirements {
  name: string;
  region: string;
  currencies: string[];
  businessRegistration: boolean;
  kycLevel: 'basic' | 'enhanced' | 'premium';
  transferLimits: {
    daily: number;
    monthly: number;
    single: number;
  };
  requiredDocuments: string[];
  complianceStandards: string[];
  dataResidency: string[];
  webhookSupport: boolean;
  apiRateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}

export const PROVIDER_REQUIREMENTS: Record<string, ProviderRequirements> = {
  plaid: {
    name: 'Plaid',
    region: 'US, Canada, UK, EU',
    currencies: ['USD', 'CAD', 'GBP', 'EUR'],
    businessRegistration: false,
    kycLevel: 'basic',
    transferLimits: {
      daily: 0, // Read-only
      monthly: 0,
      single: 0,
    },
    requiredDocuments: [
      'Business license (for business accounts)',
      'Tax identification number',
    ],
    complianceStandards: ['SOC 2 Type II', 'PCI DSS Level 1'],
    dataResidency: ['US', 'EU'],
    webhookSupport: true,
    apiRateLimits: {
      requestsPerMinute: 100,
      requestsPerDay: 10000,
    },
  },
  
  paystack: {
    name: 'Paystack',
    region: 'Nigeria',
    currencies: ['NGN'],
    businessRegistration: true,
    kycLevel: 'enhanced',
    transferLimits: {
      daily: 1000000, // 1M NGN
      monthly: 10000000, // 10M NGN
      single: 50000, // 50K NGN
    },
    requiredDocuments: [
      'CAC certificate',
      'Corporate bank account',
      'FIRS tax clearance',
      'Utility bill (business address)',
      '3 months bank statement',
      'CBN approval for transfers',
    ],
    complianceStandards: ['CBN Guidelines', 'NDIC Requirements', 'PCI DSS'],
    dataResidency: ['Nigeria'],
    webhookSupport: true,
    apiRateLimits: {
      requestsPerMinute: 60,
      requestsPerDay: 5000,
    },
  },
  
  flutterwave: {
    name: 'Flutterwave',
    region: 'Africa',
    currencies: ['NGN', 'GHS', 'KES', 'ZAR', 'USD'],
    businessRegistration: true,
    kycLevel: 'enhanced',
    transferLimits: {
      daily: 5000000, // 5M NGN
      monthly: 50000000, // 50M NGN
      single: 100000, // 100K NGN
    },
    requiredDocuments: [
      'Business registration certificate',
      'Tax identification number',
      'Corporate bank account',
      'Utility bill',
      'Bank statement',
      'AML compliance certificate',
    ],
    complianceStandards: ['CBN Guidelines', 'PCI DSS', 'AML/CFT'],
    dataResidency: ['Nigeria', 'Ghana', 'Kenya', 'South Africa'],
    webhookSupport: true,
    apiRateLimits: {
      requestsPerMinute: 100,
      requestsPerDay: 10000,
    },
  },
  
  stripe: {
    name: 'Stripe',
    region: 'Global',
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'DKK', 'NOK'],
    businessRegistration: true,
    kycLevel: 'premium',
    transferLimits: {
      daily: 100000, // $100K USD
      monthly: 1000000, // $1M USD
      single: 10000, // $10K USD
    },
    requiredDocuments: [
      'Business registration',
      'Tax identification number',
      'Corporate bank account',
      'Business address verification',
      'Beneficial ownership information',
      'AML compliance documentation',
    ],
    complianceStandards: ['PCI DSS Level 1', 'SOC 2 Type II', 'GDPR', 'CCPA'],
    dataResidency: ['US', 'EU', 'UK', 'Canada', 'Australia'],
    webhookSupport: true,
    apiRateLimits: {
      requestsPerMinute: 100,
      requestsPerDay: 10000,
    },
  },
};

export interface ComplianceCheck {
  provider: string;
  requirement: string;
  status: 'pending' | 'completed' | 'failed' | 'not_required';
  documentUrl?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  notes?: string;
}

export class ComplianceManager {
  /**
   * Get requirements for a specific provider
   */
  static getProviderRequirements(provider: string): ProviderRequirements | null {
    return PROVIDER_REQUIREMENTS[provider] || null;
  }

  /**
   * Check if user meets requirements for a provider
   */
  static async checkProviderCompliance(
    userId: string,
    provider: string
  ): Promise<{
    compliant: boolean;
    missingRequirements: string[];
    complianceScore: number;
  }> {
    const requirements = this.getProviderRequirements(provider);
    if (!requirements) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // This would typically check against your database
    // For now, return a mock implementation
    const mockCompliance = {
      compliant: false,
      missingRequirements: requirements.requiredDocuments,
      complianceScore: 0,
    };

    return mockCompliance;
  }

  /**
   * Get transfer limits for a provider
   */
  static getTransferLimits(provider: string, userTier: 'basic' | 'premium' | 'enterprise') {
    const requirements = this.getProviderRequirements(provider);
    if (!requirements) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const multiplier = userTier === 'enterprise' ? 10 : userTier === 'premium' ? 5 : 1;

    return {
      daily: requirements.transferLimits.daily * multiplier,
      monthly: requirements.transferLimits.monthly * multiplier,
      single: requirements.transferLimits.single * multiplier,
    };
  }

  /**
   * Check if a transaction amount is within limits
   */
  static validateTransactionAmount(
    provider: string,
    amount: number,
    userTier: 'basic' | 'premium' | 'enterprise'
  ): { valid: boolean; reason?: string } {
    const limits = this.getTransferLimits(provider, userTier);

    if (amount > limits.single) {
      return {
        valid: false,
        reason: `Amount exceeds single transaction limit of ${limits.single}`,
      };
    }

    // Additional checks would go here (daily/monthly limits)
    return { valid: true };
  }

  /**
   * Get required documents for a provider
   */
  static getRequiredDocuments(provider: string): string[] {
    const requirements = this.getProviderRequirements(provider);
    return requirements?.requiredDocuments || [];
  }

  /**
   * Check if business registration is required
   */
  static requiresBusinessRegistration(provider: string): boolean {
    const requirements = this.getProviderRequirements(provider);
    return requirements?.businessRegistration || false;
  }

  /**
   * Get compliance standards for a provider
   */
  static getComplianceStandards(provider: string): string[] {
    const requirements = this.getProviderRequirements(provider);
    return requirements?.complianceStandards || [];
  }

  /**
   * Get supported currencies for a provider
   */
  static getSupportedCurrencies(provider: string): string[] {
    const requirements = this.getProviderRequirements(provider);
    return requirements?.currencies || [];
  }

  /**
   * Check if provider supports a currency
   */
  static supportsCurrency(provider: string, currency: string): boolean {
    const supportedCurrencies = this.getSupportedCurrencies(provider);
    return supportedCurrencies.includes(currency);
  }

  /**
   * Get API rate limits for a provider
   */
  static getApiRateLimits(provider: string) {
    const requirements = this.getProviderRequirements(provider);
    return requirements?.apiRateLimits || { requestsPerMinute: 60, requestsPerDay: 1000 };
  }

  /**
   * Get data residency requirements
   */
  static getDataResidencyRequirements(provider: string): string[] {
    const requirements = this.getProviderRequirements(provider);
    return requirements?.dataResidency || [];
  }

  /**
   * Check if webhook support is available
   */
  static supportsWebhooks(provider: string): boolean {
    const requirements = this.getProviderRequirements(provider);
    return requirements?.webhookSupport || false;
  }

  /**
   * Get all providers that support a specific currency
   */
  static getProvidersForCurrency(currency: string): string[] {
    return Object.entries(PROVIDER_REQUIREMENTS)
      .filter(([_, requirements]) => requirements.currencies.includes(currency))
      .map(([provider, _]) => provider);
  }

  /**
   * Get all providers that support a specific region
   */
  static getProvidersForRegion(region: string): string[] {
    return Object.entries(PROVIDER_REQUIREMENTS)
      .filter(([_, requirements]) => 
        requirements.region.toLowerCase().includes(region.toLowerCase())
      )
      .map(([provider, _]) => provider);
  }

  /**
   * Get compliance summary for all providers
   */
  static getComplianceSummary() {
    return Object.entries(PROVIDER_REQUIREMENTS).map(([provider, requirements]) => ({
      provider,
      name: requirements.name,
      region: requirements.region,
      currencies: requirements.currencies,
      businessRegistration: requirements.businessRegistration,
      kycLevel: requirements.kycLevel,
      complianceStandards: requirements.complianceStandards,
    }));
  }
}

// Export types for use in other files
export type ProviderName = keyof typeof PROVIDER_REQUIREMENTS;
export type KYCLevel = 'basic' | 'enhanced' | 'premium';
export type UserTier = 'basic' | 'premium' | 'enterprise';
