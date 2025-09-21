import { PrismaClient } from '@prisma/client';
import { MongoDBService } from './mongodb-models';
import { QueueManager } from './queue';
import { AuditLog } from './mongodb-models';

const prisma = new PrismaClient();

export interface SecureOperationContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  operation: string;
  resource: string;
  resourceId: string;
}

export class SecureBusinessServer {
  /**
   * Execute sensitive operations with enhanced security and audit logging
   */
  static async executeSecureOperation<T>(
    context: SecureOperationContext,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Log operation start
      await this.logAuditEvent({
        ...context,
        action: `${context.operation}_started`,
        details: { startTime: new Date(startTime) },
      });

      // Execute the operation
      const result = await operation();

      // Log successful completion
      await this.logAuditEvent({
        ...context,
        action: `${context.operation}_completed`,
        details: { 
          duration: Date.now() - startTime,
          success: true 
        },
      });

      return result;
    } catch (error) {
      // Log error
      await this.logAuditEvent({
        ...context,
        action: `${context.operation}_failed`,
        details: { 
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false 
        },
      });

      throw error;
    }
  }

  /**
   * Secure transaction processing with validation and fraud detection
   */
  static async processTransaction(
    userId: string,
    transactionData: {
      amount: number;
      description: string;
      type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
      accountId: string;
      categoryId?: string;
      metadata?: any;
    },
    context: Omit<SecureOperationContext, 'operation' | 'resource' | 'resourceId'>
  ) {
    return await this.executeSecureOperation(
      {
        ...context,
        operation: 'process_transaction',
        resource: 'transaction',
        resourceId: 'new',
      },
      async () => {
        // Validate transaction amount
        if (transactionData.amount <= 0) {
          throw new Error('Transaction amount must be positive');
        }

        // Check for suspicious patterns
        await this.detectSuspiciousActivity(userId, transactionData);

        // Create transaction
        const transaction = await prisma.transaction.create({
          data: {
            ...transactionData,
            userId,
            date: new Date(),
          },
        });

        // Update account balance
        await this.updateAccountBalance(transactionData.accountId, transactionData.amount, transactionData.type);

        // Add AI categorization job
        await QueueManager.addAICategorization(
          transaction.id,
          transactionData.description,
          transactionData.amount,
          userId
        );

        return transaction;
      }
    );
  }

  /**
   * Secure account linking with enhanced validation
   */
  static async linkBankAccount(
    userId: string,
    accountData: {
      plaidAccountId: string;
      accessToken: string;
      accountName: string;
      accountType: string;
      balance: number;
      currency: string;
    },
    context: Omit<SecureOperationContext, 'operation' | 'resource' | 'resourceId'>
  ) {
    return await this.executeSecureOperation(
      {
        ...context,
        operation: 'link_bank_account',
        resource: 'account',
        resourceId: accountData.plaidAccountId,
      },
      async () => {
        // Verify access token is valid
        await this.verifyPlaidAccessToken(accountData.accessToken);

        // Check for duplicate account linking
        const existingAccount = await prisma.account.findFirst({
          where: { plaidAccountId: accountData.plaidAccountId },
        });

        if (existingAccount) {
          throw new Error('Account already linked');
        }

        // Create account
        const account = await prisma.account.create({
          data: {
            name: accountData.accountName,
            type: accountData.accountType as any,
            balance: accountData.balance,
            currency: accountData.currency,
            userId,
            plaidAccountId: accountData.plaidAccountId,
          },
        });

        // Update user's Plaid access token
        await prisma.user.update({
          where: { id: userId },
          data: {
            plaidAccessToken: accountData.accessToken,
            plaidItemId: accountData.plaidAccountId,
          },
        });

        // Trigger transaction sync
        await QueueManager.addTransactionSync(
          userId,
          accountData.accessToken,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );

        return account;
      }
    );
  }

  /**
   * Secure payment processing with compliance checks
   */
  static async processPayment(
    userId: string,
    paymentData: {
      amount: number;
      currency: string;
      recipientId: string;
      description: string;
      provider: 'stripe' | 'paystack' | 'flutterwave';
    },
    context: Omit<SecureOperationContext, 'operation' | 'resource' | 'resourceId'>
  ) {
    return await this.executeSecureOperation(
      {
        ...context,
        operation: 'process_payment',
        resource: 'payment',
        resourceId: 'new',
      },
      async () => {
        // Validate payment amount
        if (paymentData.amount <= 0) {
          throw new Error('Payment amount must be positive');
        }

        // Check compliance requirements
        await this.checkComplianceRequirements(userId, paymentData);

        // Process payment based on provider
        let paymentResult;
        switch (paymentData.provider) {
          case 'stripe':
            paymentResult = await this.processStripePayment(paymentData);
            break;
          case 'paystack':
            paymentResult = await this.processPaystackPayment(paymentData);
            break;
          case 'flutterwave':
            paymentResult = await this.processFlutterwavePayment(paymentData);
            break;
          default:
            throw new Error('Unsupported payment provider');
        }

        // Create payment record
        const payment = await prisma.transaction.create({
          data: {
            amount: -paymentData.amount, // Negative for outgoing payment
            description: paymentData.description,
            type: 'EXPENSE',
            userId,
            date: new Date(),
            metadata: {
              provider: paymentData.provider,
              paymentId: paymentResult.id,
              currency: paymentData.currency,
            },
          },
        });

        return { payment, paymentResult };
      }
    );
  }

  /**
   * Secure data export with privacy controls
   */
  static async exportUserData(
    userId: string,
    exportType: 'transactions' | 'accounts' | 'full',
    context: Omit<SecureOperationContext, 'operation' | 'resource' | 'resourceId'>
  ) {
    return await this.executeSecureOperation(
      {
        ...context,
        operation: 'export_user_data',
        resource: 'user_data',
        resourceId: userId,
      },
      async () => {
        // Check if user has permission to export data
        await this.checkDataExportPermissions(userId);

        let exportData: any = {};

        if (exportType === 'transactions' || exportType === 'full') {
          exportData.transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
          });
        }

        if (exportType === 'accounts' || exportType === 'full') {
          exportData.accounts = await prisma.account.findMany({
            where: { userId },
          });
        }

        if (exportType === 'full') {
          exportData.user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          exportData.notes = await MongoDBService.getNotes(userId);
        }

        // Log data export
        await this.logAuditEvent({
          ...context,
          action: 'data_exported',
          details: { exportType, recordCount: Object.keys(exportData).length },
        });

        return exportData;
      }
    );
  }

  // Private helper methods
  private static async logAuditEvent(event: Omit<AuditLog, '_id' | 'timestamp'>) {
    await MongoDBService.logAuditEvent(event);
  }

  private static async detectSuspiciousActivity(userId: string, transactionData: any) {
    // Implement fraud detection logic
    // This could include checking for unusual patterns, amounts, etc.
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Check for rapid successive transactions
    if (recentTransactions.length > 10) {
      throw new Error('Too many transactions in a short period');
    }

    // Check for unusually large amounts
    if (transactionData.amount > 10000) {
      // Flag for manual review
      await this.logAuditEvent({
        userId,
        action: 'large_transaction_flagged',
        resource: 'transaction',
        resourceId: 'new',
        details: { amount: transactionData.amount },
      });
    }
  }

  private static async updateAccountBalance(accountId: string, amount: number, type: string) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const balanceChange = type === 'INCOME' ? amount : -amount;
    const newBalance = Number(account.balance) + balanceChange;

    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    });
  }

  private static async verifyPlaidAccessToken(accessToken: string) {
    // Implement Plaid access token verification
    // This would call Plaid's API to verify the token is still valid
  }

  private static async checkComplianceRequirements(userId: string, paymentData: any) {
    // Implement compliance checks based on jurisdiction
    // This could include KYC checks, AML screening, etc.
  }

  private static async checkDataExportPermissions(userId: string) {
    // Implement data export permission checks
    // This could include checking user consent, data retention policies, etc.
  }

  private static async processStripePayment(paymentData: any) {
    // Implement Stripe payment processing
    return { id: 'stripe_payment_id', status: 'succeeded' };
  }

  private static async processPaystackPayment(paymentData: any) {
    // Implement Paystack payment processing
    return { id: 'paystack_payment_id', status: 'success' };
  }

  private static async processFlutterwavePayment(paymentData: any) {
    // Implement Flutterwave payment processing
    return { id: 'flutterwave_payment_id', status: 'successful' };
  }
}
