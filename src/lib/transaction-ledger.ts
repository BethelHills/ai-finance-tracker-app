import { PrismaClient } from '@prisma/client';
import { MongoDBService } from './mongodb-models';

const prisma = new PrismaClient();

export interface LedgerEntry {
  id: string;
  userId: string;
  accountId: string;
  transactionId: string;
  amount: any; // Prisma Decimal type
  balance: any; // Prisma Decimal type
  type: 'DEBIT' | 'CREDIT';
  description: string;
  reference: string;
  timestamp: Date;
  metadata?: any;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  currentBalance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  lastUpdated: Date;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

export class TransactionLedger {
  /**
   * Create a ledger entry for a transaction
   */
  static async createLedgerEntry(
    userId: string,
    accountId: string,
    transactionId: string,
    amount: number,
    type: 'DEBIT' | 'CREDIT',
    description: string,
    reference: string,
    metadata?: Record<string, any>
  ): Promise<LedgerEntry> {
    // Get current account balance
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Calculate new balance
    const balanceChange = type === 'CREDIT' ? amount : -amount;
    const newBalance = Number(account.balance) + balanceChange;

    // Update account balance
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    });

    // Create ledger entry
    const ledgerEntry = await prisma.ledgerEntry.create({
      data: {
        userId,
        accountId,
        transactionId,
        amount,
        balance: newBalance,
        type,
        description,
        reference,
        metadata,
      },
    });

    // Log audit event
    await MongoDBService.logAuditEvent({
      userId,
      action: 'ledger_entry_created',
      resource: 'ledger_entry',
      resourceId: ledgerEntry.id,
      details: {
        accountId,
        transactionId,
        amount,
        type,
        newBalance,
      },
    });

    return ledgerEntry;
  }

  /**
   * Get account balance with detailed breakdown
   */
  static async getAccountBalance(accountId: string): Promise<AccountBalance> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Get pending transactions
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        accountId,
        metadata: {
          path: ['status'],
          equals: 'pending',
        },
      },
    });

    const pendingAmount = pendingTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0
    );

    return {
      accountId: account.id,
      accountName: account.name,
      currentBalance: Number(account.balance),
      availableBalance: Number(account.balance) - pendingAmount,
      pendingBalance: pendingAmount,
      currency: account.currency,
      lastUpdated: account.updatedAt,
    };
  }

  /**
   * Get transaction summary for a period
   */
  static async getTransactionSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TransactionSummary> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const totalExpenses = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      period: { start: startDate, end: endDate },
    };
  }

  /**
   * Get ledger entries for an account
   */
  static async getLedgerEntries(
    accountId: string,
    limit = 100,
    offset = 0
  ): Promise<LedgerEntry[]> {
    return await prisma.ledgerEntry.findMany({
      where: { accountId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Reconcile account with external source
   */
  static async reconcileAccount(
    accountId: string,
    externalBalance: number,
    tolerance = 0.01
  ): Promise<{
    isReconciled: boolean;
    difference: number;
    requiresAdjustment: boolean;
  }> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const internalBalance = Number(account.balance);
    const difference = Math.abs(internalBalance - externalBalance);
    const isReconciled = difference <= tolerance;

    // Log reconciliation attempt
    await MongoDBService.logAuditEvent({
      userId: account.userId,
      action: 'account_reconciliation',
      resource: 'account',
      resourceId: accountId,
      details: {
        internalBalance,
        externalBalance,
        difference,
        isReconciled,
        tolerance,
      },
    });

    return {
      isReconciled,
      difference,
      requiresAdjustment: !isReconciled && difference > tolerance,
    };
  }

  /**
   * Create adjustment entry for reconciliation
   */
  static async createAdjustmentEntry(
    accountId: string,
    adjustmentAmount: number,
    reason: string,
    reference: string
  ): Promise<LedgerEntry> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const type = adjustmentAmount > 0 ? 'CREDIT' : 'DEBIT';
    const amount = Math.abs(adjustmentAmount);

    return await this.createLedgerEntry(
      account.userId,
      accountId,
      `adjustment_${Date.now()}`,
      amount,
      type,
      `Adjustment: ${reason}`,
      reference,
      {
        adjustment: true,
        reason,
        originalAmount: adjustmentAmount,
      }
    );
  }

  /**
   * Get financial health metrics
   */
  static async getFinancialHealthMetrics(userId: string): Promise<{
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    debtToIncomeRatio: number;
  }> {
    const accounts = await prisma.account.findMany({
      where: { userId },
    });

    const totalAssets = accounts
      .filter(
        acc =>
          acc.type === 'CHECKING' ||
          acc.type === 'SAVINGS' ||
          acc.type === 'INVESTMENT'
      )
      .reduce((sum, acc) => sum + Number(acc.balance), 0);

    const totalLiabilities = accounts
      .filter(acc => acc.type === 'CREDIT_CARD' || acc.type === 'LOAN')
      .reduce((sum, acc) => sum + Math.abs(Number(acc.balance)), 0);

    const netWorth = totalAssets - totalLiabilities;

    // Get last 30 days transactions
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
    });

    const monthlyIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const monthlyExpenses = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

    const savingsRate =
      monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    const debtToIncomeRatio =
      monthlyIncome > 0 ? totalLiabilities / monthlyIncome : 0;

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      debtToIncomeRatio,
    };
  }

  /**
   * Generate financial report
   */
  static async generateFinancialReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: TransactionSummary;
    healthMetrics: any;
    categoryBreakdown: any[];
    monthlyTrends: any[];
  }> {
    const summary = await this.getTransactionSummary(
      userId,
      startDate,
      endDate
    );
    const healthMetrics = await this.getFinancialHealthMetrics(userId);

    // Get category breakdown
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const categoryBreakdown = transactions.reduce(
      (acc, tx) => {
        const category = tx.aiCategory || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { category, amount: 0, count: 0 };
        }
        acc[category].amount += Math.abs(Number(tx.amount));
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, any>
    );

    // Get monthly trends
    const monthlyTrends = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const monthSummary = await this.getTransactionSummary(
        userId,
        monthStart,
        monthEnd
      );
      monthlyTrends.push({
        month: monthStart.toISOString().substring(0, 7),
        ...monthSummary,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return {
      summary,
      healthMetrics,
      categoryBreakdown: Object.values(categoryBreakdown),
      monthlyTrends,
    };
  }
}
