import crypto from 'crypto';
import { FieldEncryption } from './field-encryption';

/**
 * Immutable Audit Trail Service
 * Creates tamper-proof audit logs for compliance and legal trace
 */

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  hash: string;
  previousHash?: string;
  signature: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category:
    | 'authentication'
    | 'authorization'
    | 'data_access'
    | 'data_modification'
    | 'payment'
    | 'compliance'
    | 'system';
}

export interface TransactionRecord {
  id: string;
  timestamp: Date;
  userId: string;
  transactionType: 'income' | 'expense' | 'transfer' | 'payment' | 'refund';
  amount: number;
  currency: string;
  description: string;
  accountId: string;
  counterpartyId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata: Record<string, any>;
  hash: string;
  previousHash?: string;
  signature: string;
  complianceFlags: string[];
  riskScore: number;
}

export interface ComplianceReport {
  period: {
    start: Date;
    end: Date;
  };
  totalEvents: number;
  totalTransactions: number;
  complianceScore: number;
  violations: string[];
  recommendations: string[];
  auditTrailIntegrity: boolean;
}

export class AuditTrailService {
  private static readonly HASH_ALGORITHM = 'sha256';
  private static readonly SIGNATURE_ALGORITHM = 'RSA-SHA256';

  /**
   * Create immutable audit event
   */
  static async createAuditEvent(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any>,
    options: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      category?:
        | 'authentication'
        | 'authorization'
        | 'data_access'
        | 'data_modification'
        | 'payment'
        | 'compliance'
        | 'system';
    } = {}
  ): Promise<AuditEvent> {
    const timestamp = new Date();
    const eventId = this.generateEventId();

    // Get previous hash for chain integrity
    const previousHash = await this.getLastAuditHash();

    // Create event data
    const eventData = {
      id: eventId,
      timestamp,
      userId,
      action,
      resource,
      resourceId,
      details: this.sanitizeDetails(details),
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      sessionId: options.sessionId,
      severity: options.severity || 'low',
      category: options.category || 'system',
    };

    // Calculate hash
    const hash = this.calculateEventHash(eventData, previousHash);

    // Create digital signature
    const signature = await this.signEvent(eventData, hash);

    const auditEvent: AuditEvent = {
      ...eventData,
      hash,
      previousHash,
      signature,
    };

    // Store immutable event
    await this.storeAuditEvent(auditEvent);

    // Log for monitoring
    console.log(`[AUDIT] ${action}: ${userId} - ${resource}/${resourceId}`);

    return auditEvent;
  }

  /**
   * Create immutable transaction record
   */
  static async createTransactionRecord(
    userId: string,
    transactionType: 'income' | 'expense' | 'transfer' | 'payment' | 'refund',
    amount: number,
    currency: string,
    description: string,
    accountId: string,
    options: {
      counterpartyId?: string;
      status?: 'pending' | 'completed' | 'failed' | 'cancelled';
      metadata?: Record<string, any>;
      complianceFlags?: string[];
      riskScore?: number;
    } = {}
  ): Promise<TransactionRecord> {
    const timestamp = new Date();
    const transactionId = this.generateTransactionId();

    // Get previous hash for chain integrity
    const previousHash = await this.getLastTransactionHash();

    // Create transaction data
    const transactionData = {
      id: transactionId,
      timestamp,
      userId,
      transactionType,
      amount,
      currency,
      description,
      accountId,
      counterpartyId: options.counterpartyId,
      status: options.status || 'pending',
      metadata: options.metadata || {},
      complianceFlags: options.complianceFlags || [],
      riskScore: options.riskScore || 0,
    };

    // Calculate hash
    const hash = this.calculateTransactionHash(transactionData, previousHash);

    // Create digital signature
    const signature = await this.signTransaction(transactionData, hash);

    const transactionRecord: TransactionRecord = {
      ...transactionData,
      hash,
      previousHash,
      signature,
    };

    // Store immutable transaction
    await this.storeTransactionRecord(transactionRecord);

    // Log for monitoring
    console.log(
      `[TRANSACTION] ${transactionType}: ${userId} - ${amount} ${currency}`
    );

    return transactionRecord;
  }

  /**
   * Verify audit trail integrity
   */
  static async verifyAuditTrailIntegrity(): Promise<{
    valid: boolean;
    errors: string[];
    totalEvents: number;
    verifiedEvents: number;
  }> {
    const errors: string[] = [];
    let totalEvents = 0;
    let verifiedEvents = 0;

    try {
      // Get all audit events
      const events = await this.getAllAuditEvents();
      totalEvents = events.length;

      // Verify each event
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const isValid = await this.verifyEventIntegrity(
          event,
          i > 0 ? events[i - 1] : null
        );

        if (isValid) {
          verifiedEvents++;
        } else {
          errors.push(`Event ${event.id} failed integrity check`);
        }
      }
    } catch (error) {
      errors.push(`Failed to verify audit trail: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      totalEvents,
      verifiedEvents,
    };
  }

  /**
   * Generate compliance report
   */
  static async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const events = await this.getAuditEventsInRange(startDate, endDate);
    const transactions = await this.getTransactionsInRange(startDate, endDate);

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(events, transactions);

    // Identify violations
    const violations = this.identifyViolations(events, transactions);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      events,
      transactions,
      violations
    );

    // Check audit trail integrity
    const integrityCheck = await this.verifyAuditTrailIntegrity();

    return {
      period: { start: startDate, end: endDate },
      totalEvents: events.length,
      totalTransactions: transactions.length,
      complianceScore,
      violations,
      recommendations,
      auditTrailIntegrity: integrityCheck.valid,
    };
  }

  /**
   * Search audit events
   */
  static async searchAuditEvents(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    severity?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditEvent[]> {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [];
  }

  /**
   * Export audit trail for legal purposes
   */
  static async exportAuditTrail(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<{
    data: any;
    format: string;
    hash: string;
    signature: string;
  }> {
    const events = await this.getAuditEventsInRange(startDate, endDate);
    const transactions = await this.getTransactionsInRange(startDate, endDate);

    const exportData = {
      metadata: {
        exportDate: new Date(),
        period: { start: startDate, end: endDate },
        totalEvents: events.length,
        totalTransactions: transactions.length,
      },
      events,
      transactions,
    };

    // Calculate hash for integrity
    const hash = crypto
      .createHash(this.HASH_ALGORITHM)
      .update(JSON.stringify(exportData))
      .digest('hex');

    // Create signature
    const signature = await this.signData(exportData);

    return {
      data: exportData,
      format,
      hash,
      signature,
    };
  }

  // Private helper methods

  private static generateEventId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private static generateTransactionId(): string {
    return `txn_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private static async getLastAuditHash(): Promise<string | undefined> {
    // In a real implementation, this would get the last event's hash
    return undefined;
  }

  private static async getLastTransactionHash(): Promise<string | undefined> {
    // In a real implementation, this would get the last transaction's hash
    return undefined;
  }

  private static calculateEventHash(
    eventData: any,
    previousHash?: string
  ): string {
    const dataToHash = {
      ...eventData,
      previousHash,
    };

    return crypto
      .createHash(this.HASH_ALGORITHM)
      .update(JSON.stringify(dataToHash))
      .digest('hex');
  }

  private static calculateTransactionHash(
    transactionData: any,
    previousHash?: string
  ): string {
    const dataToHash = {
      ...transactionData,
      previousHash,
    };

    return crypto
      .createHash(this.HASH_ALGORITHM)
      .update(JSON.stringify(dataToHash))
      .digest('hex');
  }

  private static async signEvent(
    eventData: any,
    hash: string
  ): Promise<string> {
    // In a real implementation, this would use a private key
    return crypto
      .createHmac('sha256', 'audit-signing-key')
      .update(JSON.stringify({ eventData, hash }))
      .digest('hex');
  }

  private static async signTransaction(
    transactionData: any,
    hash: string
  ): Promise<string> {
    // In a real implementation, this would use a private key
    return crypto
      .createHmac('sha256', 'transaction-signing-key')
      .update(JSON.stringify({ transactionData, hash }))
      .digest('hex');
  }

  private static async signData(data: any): Promise<string> {
    // In a real implementation, this would use a private key
    return crypto
      .createHmac('sha256', 'export-signing-key')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private static sanitizeDetails(
    details: Record<string, any>
  ): Record<string, any> {
    const sanitized = { ...details };

    // Remove sensitive information
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'ssn',
      'cardNumber',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private static async storeAuditEvent(event: AuditEvent): Promise<void> {
    // In a real implementation, this would store in an immutable database
    console.log(`[AUDIT_STORE] Stored event: ${event.id}`);
  }

  private static async storeTransactionRecord(
    transaction: TransactionRecord
  ): Promise<void> {
    // In a real implementation, this would store in an immutable database
    console.log(`[TRANSACTION_STORE] Stored transaction: ${transaction.id}`);
  }

  private static async getAllAuditEvents(): Promise<AuditEvent[]> {
    // Mock implementation
    return [];
  }

  private static async getAuditEventsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<AuditEvent[]> {
    // Mock implementation
    return [];
  }

  private static async getTransactionsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<TransactionRecord[]> {
    // Mock implementation
    return [];
  }

  private static async verifyEventIntegrity(
    event: AuditEvent,
    previousEvent: AuditEvent | null
  ): Promise<boolean> {
    // Verify hash
    const expectedHash = this.calculateEventHash(
      {
        id: event.id,
        timestamp: event.timestamp,
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        details: event.details,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        sessionId: event.sessionId,
        severity: event.severity,
        category: event.category,
      },
      previousEvent?.hash
    );

    if (event.hash !== expectedHash) {
      return false;
    }

    // Verify signature
    const expectedSignature = await this.signEvent(
      {
        id: event.id,
        timestamp: event.timestamp,
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        details: event.details,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        sessionId: event.sessionId,
        severity: event.severity,
        category: event.category,
      },
      event.hash
    );

    return event.signature === expectedSignature;
  }

  private static calculateComplianceScore(
    events: AuditEvent[],
    transactions: TransactionRecord[]
  ): number {
    // Mock implementation - would calculate based on compliance rules
    return 95;
  }

  private static identifyViolations(
    events: AuditEvent[],
    transactions: TransactionRecord[]
  ): string[] {
    // Mock implementation - would identify compliance violations
    return [];
  }

  private static generateRecommendations(
    events: AuditEvent[],
    transactions: TransactionRecord[],
    violations: string[]
  ): string[] {
    // Mock implementation - would generate recommendations
    return [];
  }
}
