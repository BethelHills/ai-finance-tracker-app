import { PrismaClient, Prisma } from '@prisma/client';

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
  }): Promise<LedgerTransaction> {
    const transaction = await prisma.$transaction(async (tx) => {
      // Create the transaction
      const newTransaction = await tx.transaction.create({
        data: {
          external_id: data.external_id,
          user_id: data.user_id,
          account_id: data.account_id,
          amount: data.amount,
          currency: data.currency,
          status: 'pending',
          type: data.type,
          description: data.description,
          reference: data.reference,
          provider: data.provider,
          provider_data: data.provider_data || {},
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
            transaction_id: newTransaction.id,
            account_id: data.account_id,
            user_id: data.user_id,
            amount: data.amount,
            balance_after: account.balance + data.amount,
            type: data.amount >= 0 ? 'credit' : 'debit',
            description: data.description,
            reference: data.reference,
          },
        });
      }

      return newTransaction;
    });

    return transaction as LedgerTransaction;
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'completed' | 'failed' | 'reversed' | 'cancelled',
    metadata?: any
  ): Promise<LedgerTransaction> {
    const transaction = await prisma.$transaction(async (tx) => {
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
          status,
          metadata: metadata ? { ...existingTransaction.metadata, ...metadata } : existingTransaction.metadata,
          processed_at: status === 'completed' ? new Date() : existingTransaction.processed_at,
        },
      });

      // If status changed to completed, update account balance
      if (status === 'completed' && existingTransaction.status !== 'completed') {
        await tx.account.update({
          where: { id: existingTransaction.account_id },
          data: {
            balance: {
              increment: existingTransaction.amount,
            },
          },
        });
      }

      return updatedTransaction;
    });

    return transaction as LedgerTransaction;
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
  }): Promise<{ transactions: LedgerTransaction[]; total: number }> {
    const where: Prisma.TransactionWhereInput = {
      user_id: filters.user_id,
      ...(filters.account_id && { account_id: filters.account_id }),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.provider && { provider: filters.provider }),
      ...(filters.start_date && { created_at: { gte: filters.start_date } }),
      ...(filters.end_date && { created_at: { lte: filters.end_date } }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions as LedgerTransaction[],
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

    return account?.balance || 0;
  }

  /**
   * Get ledger entries for an account
   */
  static async getLedgerEntries(
    accountId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<LedgerEntry[]> {
    const entries = await prisma.ledgerEntry.findMany({
      where: { account_id: accountId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return entries as LedgerEntry[];
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
        user_id: userId,
        account_id: accountId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalTransactions = transactions.length;
    const reconciledTransactions = transactions.filter(t => t.status === 'completed').length;
    const unreconciledTransactions = totalTransactions - reconciledTransactions;
    
    // Calculate discrepancies (simplified logic)
    const discrepancies = transactions.filter(t => 
      t.status === 'failed' || t.status === 'reversed'
    ).length;

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
  ): Promise<LedgerTransaction | null> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        external_id: externalId,
        provider: provider as any,
      },
    });

    return transaction as LedgerTransaction | null;
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
  }): Promise<LedgerAccount> {
    const account = await prisma.account.create({
      data: {
        user_id: data.user_id,
        name: data.name,
        type: data.type,
        balance: data.balance,
        currency: data.currency,
        provider: data.provider,
        provider_account_id: data.provider_account_id,
        is_active: true,
      },
    });

    return account as LedgerAccount;
  }

  /**
   * Update account balance
   */
  static async updateAccountBalance(
    accountId: string,
    newBalance: number
  ): Promise<LedgerAccount> {
    const account = await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: newBalance,
        updated_at: new Date(),
      },
    });

    return account as LedgerAccount;
  }

  /**
   * Get account by provider account ID
   */
  static async getAccountByProviderId(
    providerAccountId: string,
    provider: string
  ): Promise<LedgerAccount | null> {
    const account = await prisma.account.findFirst({
      where: {
        provider_account_id: providerAccountId,
        provider: provider as any,
      },
    });

    return account as LedgerAccount | null;
  }

  /**
   * Get user's accounts
   */
  static async getUserAccounts(userId: string): Promise<LedgerAccount[]> {
    const accounts = await prisma.account.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return accounts as LedgerAccount[];
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
        user_id: userId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0));

    const netAmount = totalIncome - totalExpenses;

    const byType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount: transactions.length,
      byType,
      byStatus,
    };
  }
}
