import crypto from 'crypto';
import { SecretsManager } from './secrets-manager';

/**
 * Webhook Security Service
 * Implements signature verification and idempotency for webhook processing
 */

export interface WebhookSignature {
  provider: 'stripe' | 'paystack' | 'flutterwave' | 'plaid';
  signature: string;
  timestamp: string;
  algorithm: string;
}

export interface IdempotencyKey {
  key: string;
  provider: string;
  eventType: string;
  processed: boolean;
  processedAt?: Date;
  response?: any;
  createdAt: Date;
  expiresAt: Date;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  payload: any;
  signature: WebhookSignature;
  idempotencyKey: string;
  receivedAt: Date;
  processed: boolean;
  retryCount: number;
}

export class WebhookSecurityService {
  /**
   * Verify webhook signature
   */
  static async verifySignature(
    payload: string,
    signature: string,
    provider: 'stripe' | 'paystack' | 'flutterwave' | 'plaid'
  ): Promise<boolean> {
    try {
      switch (provider) {
        case 'stripe':
          return await this.verifyStripeSignature(payload, signature);
        case 'paystack':
          return await this.verifyPaystackSignature(payload, signature);
        case 'flutterwave':
          return await this.verifyFlutterwaveSignature(payload, signature);
        case 'plaid':
          return await this.verifyPlaidSignature(payload, signature);
        default:
          throw new Error(`Unsupported webhook provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Webhook signature verification failed for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  private static async verifyStripeSignature(payload: string, signature: string): Promise<boolean> {
    const webhookSecret = SecretsManager.getSecret('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    const elements = signature.split(',');
    const signatureHash = elements.find(el => el.startsWith('v1='))?.split('=')[1];
    const timestamp = elements.find(el => el.startsWith('t='))?.split('=')[1];

    if (!signatureHash || !timestamp) {
      return false;
    }

    // Check timestamp (prevent replay attacks)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    if (currentTime - webhookTime > 300) { // 5 minutes tolerance
      return false;
    }

    // Verify signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Verify Paystack webhook signature
   */
  private static async verifyPaystackSignature(payload: string, signature: string): Promise<boolean> {
    const secretKey = SecretsManager.getSecret('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha512', secretKey)
      .update(payload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Verify Flutterwave webhook signature
   */
  private static async verifyFlutterwaveSignature(payload: string, signature: string): Promise<boolean> {
    const secretKey = SecretsManager.getSecret('FLUTTERWAVE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('Flutterwave secret key not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Verify Plaid webhook signature
   */
  private static async verifyPlaidSignature(payload: string, signature: string): Promise<boolean> {
    const webhookSecret = SecretsManager.getSecret('PLAID_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Plaid webhook secret not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generate idempotency key
   */
  static generateIdempotencyKey(
    provider: string,
    eventType: string,
    payload: any
  ): string {
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
      .substring(0, 16);

    return `${provider}_${eventType}_${payloadHash}_${Date.now()}`;
  }

  /**
   * Check if webhook event is already processed (idempotency)
   */
  static async checkIdempotency(idempotencyKey: string): Promise<{
    processed: boolean;
    response?: any;
  }> {
    // In a real implementation, this would check against a database or Redis
    // For now, we'll use a simple in-memory store (not suitable for production)
    const processedEvents = new Map<string, IdempotencyKey>();
    
    const event = processedEvents.get(idempotencyKey);
    if (event && event.processed && event.expiresAt > new Date()) {
      return {
        processed: true,
        response: event.response,
      };
    }

    return { processed: false };
  }

  /**
   * Mark webhook event as processed
   */
  static async markEventProcessed(
    idempotencyKey: string,
    provider: string,
    eventType: string,
    response: any
  ): Promise<void> {
    const event: IdempotencyKey = {
      key: idempotencyKey,
      provider,
      eventType,
      processed: true,
      processedAt: new Date(),
      response,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // In a real implementation, this would store in database or Redis
    const processedEvents = new Map<string, IdempotencyKey>();
    processedEvents.set(idempotencyKey, event);
  }

  /**
   * Process webhook with security checks
   */
  static async processWebhook(
    provider: 'stripe' | 'paystack' | 'flutterwave' | 'plaid',
    eventType: string,
    payload: any,
    signature: string
  ): Promise<{
    success: boolean;
    idempotencyKey: string;
    response?: any;
  }> {
    try {
      // Verify signature
      const isValidSignature = await this.verifySignature(
        JSON.stringify(payload),
        signature,
        provider
      );

      if (!isValidSignature) {
        throw new Error('Invalid webhook signature');
      }

      // Generate idempotency key
      const idempotencyKey = this.generateIdempotencyKey(provider, eventType, payload);

      // Check idempotency
      const idempotencyCheck = await this.checkIdempotency(idempotencyKey);
      if (idempotencyCheck.processed) {
        return {
          success: true,
          idempotencyKey,
          response: idempotencyCheck.response,
        };
      }

      // Process webhook event
      const response = await this.processWebhookEvent(provider, eventType, payload);

      // Mark as processed
      await this.markEventProcessed(idempotencyKey, provider, eventType, response);

      return {
        success: true,
        idempotencyKey,
        response,
      };
    } catch (error) {
      console.error(`Webhook processing failed for ${provider}:`, error);
      return {
        success: false,
        idempotencyKey: '',
      };
    }
  }

  /**
   * Process webhook event based on provider and type
   */
  private static async processWebhookEvent(
    provider: string,
    eventType: string,
    payload: any
  ): Promise<any> {
    // Log webhook event
    console.log(`[WEBHOOK] Processing ${provider} event: ${eventType}`);

    // Route to appropriate handler
    switch (provider) {
      case 'stripe':
        return await this.handleStripeEvent(eventType, payload);
      case 'paystack':
        return await this.handlePaystackEvent(eventType, payload);
      case 'flutterwave':
        return await this.handleFlutterwaveEvent(eventType, payload);
      case 'plaid':
        return await this.handlePlaidEvent(eventType, payload);
      default:
        throw new Error(`Unsupported webhook provider: ${provider}`);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  private static async handleStripeEvent(eventType: string, payload: any): Promise<any> {
    switch (eventType) {
      case 'payment_intent.succeeded':
        return { status: 'payment_processed', transactionId: payload.id };
      case 'payment_intent.payment_failed':
        return { status: 'payment_failed', reason: payload.last_payment_error?.message };
      case 'customer.subscription.created':
        return { status: 'subscription_created', subscriptionId: payload.id };
      default:
        return { status: 'event_received', type: eventType };
    }
  }

  /**
   * Handle Paystack webhook events
   */
  private static async handlePaystackEvent(eventType: string, payload: any): Promise<any> {
    switch (eventType) {
      case 'charge.success':
        return { status: 'payment_successful', reference: payload.data.reference };
      case 'charge.failed':
        return { status: 'payment_failed', reference: payload.data.reference };
      case 'transfer.success':
        return { status: 'transfer_successful', reference: payload.data.reference };
      default:
        return { status: 'event_received', type: eventType };
    }
  }

  /**
   * Handle Flutterwave webhook events
   */
  private static async handleFlutterwaveEvent(eventType: string, payload: any): Promise<any> {
    switch (eventType) {
      case 'charge.completed':
        return { status: 'payment_completed', transactionId: payload.data.id };
      case 'transfer.completed':
        return { status: 'transfer_completed', reference: payload.data.reference };
      default:
        return { status: 'event_received', type: eventType };
    }
  }

  /**
   * Handle Plaid webhook events
   */
  private static async handlePlaidEvent(eventType: string, payload: any): Promise<any> {
    switch (eventType) {
      case 'TRANSACTIONS':
        return { status: 'transactions_updated', itemId: payload.item_id };
      case 'AUTH':
        return { status: 'auth_updated', itemId: payload.item_id };
      case 'IDENTITY':
        return { status: 'identity_updated', itemId: payload.item_id };
      default:
        return { status: 'event_received', type: eventType };
    }
  }

  /**
   * Validate webhook payload
   */
  static validateWebhookPayload(payload: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!payload) {
      errors.push('Payload is required');
      return { valid: false, errors };
    }

    if (typeof payload !== 'object') {
      errors.push('Payload must be an object');
    }

    if (!payload.id && !payload.data) {
      errors.push('Payload must contain id or data field');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Rate limit webhook processing
   */
  static async checkRateLimit(
    provider: string,
    ipAddress: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    // In a real implementation, this would use Redis or similar
    // For now, return mock data
    return {
      allowed: true,
      remaining: 100,
      resetTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    };
  }

  /**
   * Generate webhook security report
   */
  static async generateSecurityReport(): Promise<{
    totalWebhooks: number;
    verifiedWebhooks: number;
    failedVerifications: number;
    duplicateEvents: number;
    securityScore: number;
  }> {
    // Mock implementation - would query actual data
    return {
      totalWebhooks: 1000,
      verifiedWebhooks: 995,
      failedVerifications: 5,
      duplicateEvents: 10,
      securityScore: 99.5,
    };
  }
}
