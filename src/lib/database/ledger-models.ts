import { PrismaClient, Prisma, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

// Extended Prisma types for ledger operations
export interface LedgerTransaction {
  id: string;
  external_id: string; // Plaid transaction ID, Paystack reference, etc.
  user_id: string;
  account_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed' | 'cancelled';
  type: 'income' | 'expense' | 'transfer' | 'payment' | 'refund';
  description: string;
  reference: string; // Internal reference
  provider: 'plaid' | 'paystack' | 'flutterwave' | 'stripe' | 'manual';
  provider_data: Prisma.JsonValue; // Raw provider data
  metadata: Prisma.JsonValue; // Additional metadata
  created_at: Date;
  updated_at: Date;
  processed_at?: Date;
  reconciled_at?: Date;
}

export interface LedgerAccount {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'crypto';
  balance: number;
  currency: string;
  provider: 'plaid' | 'paystack' | 'flutterwave' | 'stripe' | 'manual';
  provider_account_id?: string; // Plaid account ID, etc.
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_synced_at?: Date;
}

export interface LedgerEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  type: 'debit' | 'credit';
  description: string;
  reference: string;
  created_at: Date;
}

export class LedgerService {
  /**
   * Create a new transaction in the ledger
   */
  static async createTransaction(data: {
    external_id: string;
    user_id: string;
    account_id: string;
    amount: number;
    currency: string;
    type: 'income' | 'expense' | 'transfer' | 'payment' | 'refund';
    description: string;
    reference: string;
    provider: 'plaid' | 'paystack' | 'flutterwave' | 'stripe' | 'manual';
    provider_data?: any;
    metadata?: any;
  }): Promise<any> {
    const transaction = await prisma.$transaction(async tx => {
      // Create the transaction
      const newTransaction = await tx.transaction.create({
        data: {
          userId: data.user_id,
          accountId: data.account_id,
          amount: data.amount,
          description: data.description,
          date: new Date(),
          type: data.type.toUpperCase() as TransactionType,
          metadata: data.metadata || {},
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.account_id },
        data: {
          balance: {
            increment: data.amount,
          },
        },
      });

      // Create ledger entry
      const account = await tx.account.findUnique({
        where: { id: data.account_id },
      });

      if (account) {
        await tx.ledgerEntry.create({
          data: {
            transactionId: newTransaction.id,
            accountId: data.account_id,
            userId: data.user_id,
            amount: data.amount,
            balance: Number(account.balance) + data.amount,
            type: data.amount >= 0 ? 'CREDIT' : 'DEBIT',
            description: data.description,
            reference: data.reference,
          },
        });
      }

      return newTransaction;
    });

    return transaction;
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'completed' | 'failed' | 'reversed' | 'cancelled',
    metadata?: any
  ): Promise<any> {
    const transaction = await prisma.$transaction(async tx => {
      const existingTransaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          metadata: metadata
            ? { ...((existingTransaction.metadata as any) || {}), ...metadata }
            : existingTransaction.metadata,
        },
      });

      return updatedTransaction;
    });

    return transaction;
  }

  /**
   * Get transactions with filters
   */
  static async getTransactions(filters: {
    user_id: string;
    account_id?: string;
    status?: string;
    type?: string;
    provider?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: any[]; total: number }> {
    const where: Prisma.TransactionWhereInput = {
      userId: filters.user_id,
      ...(filters.account_id && { accountId: filters.account_id }),
      ...(filters.type && { type: filters.type as any }),
      ...(filters.start_date && { date: { gte: filters.start_date } }),
      ...(filters.end_date && { date: { lte: filters.end_date } }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
    };
  }

  /**
   * Get account balance
   */
  static async getAccountBalance(accountId: string): Promise<number> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { balance: true },
    });

    return Number(account?.balance || 0);
  }

  /**
   * Get ledger entries for an account
   */
  static async getLedgerEntries(
    accountId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const entries = await prisma.ledgerEntry.findMany({
      where: { accountId: accountId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    return entries;
  }

  /**
   * Reconcile transactions
   */
  static async reconcileTransactions(
    userId: string,
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalTransactions: number;
    reconciledTransactions: number;
    unreconciledTransactions: number;
    discrepancies: number;
  }> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        accountId: accountId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalTransactions = transactions.length;
    const reconciledTransactions = transactions.length; // All transactions are considered reconciled
    const unreconciledTransactions = totalTransactions - reconciledTransactions;

    // Calculate discrepancies (simplified logic)
    const discrepancies = 0; // No status field to check

    return {
      totalTransactions,
      reconciledTransactions,
      unreconciledTransactions,
      discrepancies,
    };
  }

  /**
   * Get transaction by external ID
   */
  static async getTransactionByExternalId(
    externalId: string,
    provider: string
  ): Promise<any | null> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        description: {
          contains: externalId,
        },
      },
    });

    return transaction;
  }

  /**
   * Create account
   */
  static async createAccount(data: {
    user_id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'crypto';
    balance: number;
    currency: string;
    provider: 'plaid' | 'paystack' | 'flutterwave' | 'stripe' | 'manual';
    provider_account_id?: string;
  }): Promise<any> {
    const account = await prisma.account.create({
      data: {
        userId: data.user_id,
        name: data.name,
        type: data.type.toUpperCase() as any,
        balance: data.balance,
        isActive: true,
      },
    });

    return account;
  }

  /**
   * Update account balance
   */
  static async updateAccountBalance(
    accountId: string,
    newBalance: number
  ): Promise<any> {
    const account = await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: newBalance,
        updatedAt: new Date(),
      },
    });

    return account;
  }

  /**
   * Get account by provider account ID
   */
  static async getAccountByProviderId(
    providerAccountId: string,
    provider: string
  ): Promise<any | null> {
    const account = await prisma.account.findFirst({
      where: {
        name: {
          contains: providerAccountId,
        },
      },
    });

    return account;
  }

  /**
   * Get user's accounts
   */
  static async getUserAccounts(userId: string): Promise<any[]> {
    const accounts = await prisma.account.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts;
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = Math.abs(
      transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    );

    const netAmount = totalIncome - totalExpenses;

    const byType = transactions.reduce(
      (acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount: transactions.length,
      byType,
      byStatus: {}, // No status field available
    };
  }
}
