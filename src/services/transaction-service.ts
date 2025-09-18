import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod validation schemas generated from schema
export const CreateTransactionSchema = z.object({
  amount: z.number().finite(),
  description: z.string().min(1).max(255),
  date: z.date(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
  isRecurring: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export const UpdateTransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().finite().optional(),
  description: z.string().min(1).max(255).optional(),
  date: z.date().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  isRecurring: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export const TransactionQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z.enum(['date', 'amount', 'description']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// TypeScript types
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

export interface TransactionWithRelations {
  id: string;
  amount: any; // Prisma Decimal type
  description: string;
  date: Date;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string | null;
  accountId: string;
  userId: string;
  isRecurring: boolean;
  metadata?: any;
  aiCategory?: string | null;
  aiConfidence?: number | null;
  aiTags?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  account: {
    id: string;
    name: string;
    type: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface PaginatedTransactions {
  data: TransactionWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  averageTransaction: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export class TransactionService {
  /**
   * Create a new transaction
   */
  static async create(
    input: CreateTransactionInput
  ): Promise<TransactionWithRelations> {
    try {
      const validatedInput = CreateTransactionSchema.parse(input);

      const transaction = await prisma.transaction.create({
        data: validatedInput,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return transaction;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      throw new Error(`Failed to create transaction: ${error}`);
    }
  }

  /**
   * Get transaction by ID
   */
  static async getById(
    id: string,
    userId: string
  ): Promise<TransactionWithRelations | null> {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error}`);
    }
  }

  /**
   * Get transactions with pagination and filtering
   */
  static async getMany(
    query: TransactionQuery
  ): Promise<PaginatedTransactions> {
    try {
      const validatedQuery = TransactionQuerySchema.parse(query);
      const {
        page,
        limit,
        search,
        type,
        categoryId,
        accountId,
        userId,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      } = validatedQuery;

      // Build where clause
      const where: any = {
        userId,
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(accountId && { accountId }),
        ...(startDate &&
          endDate && {
            date: {
              gte: startDate,
              lte: endDate,
            },
          }),
        ...(search && {
          OR: [
            { description: { contains: search, mode: 'insensitive' } },
            { account: { name: { contains: search, mode: 'insensitive' } } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      };

      // Get total count
      const total = await prisma.transaction.count({ where });

      // Get transactions
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      throw new Error(`Failed to get transactions: ${error}`);
    }
  }

  /**
   * Update transaction
   */
  static async update(
    input: UpdateTransactionInput
  ): Promise<TransactionWithRelations> {
    try {
      const validatedInput = UpdateTransactionSchema.parse(input);
      const { id, ...updateData } = validatedInput;

      const transaction = await prisma.transaction.update({
        where: { id },
        data: updateData,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return transaction;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      throw new Error(`Failed to update transaction: ${error}`);
    }
  }

  /**
   * Delete transaction
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    try {
      const result = await prisma.transaction.deleteMany({
        where: {
          id,
          userId,
        },
      });

      return result.count > 0;
    } catch (error) {
      throw new Error(`Failed to delete transaction: ${error}`);
    }
  }

  /**
   * Get transaction statistics
   */
  static async getStats(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TransactionStats> {
    try {
      const where: any = {
        userId,
        ...(startDate &&
          endDate && {
            date: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const [transactions, categoryStats] = await Promise.all([
        prisma.transaction.findMany({
          where,
          select: {
            amount: true,
            type: true,
          },
        }),
        prisma.transaction.groupBy({
          by: ['categoryId'],
          where: {
            ...where,
            type: 'EXPENSE',
          },
          _sum: {
            amount: true,
          },
          _count: {
            id: true,
          },
        }),
      ]);

      const totalIncome = transactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      const netAmount = totalIncome - totalExpenses;
      const transactionCount = transactions.length;
      const averageTransaction =
        transactionCount > 0
          ? (totalIncome + totalExpenses) / transactionCount
          : 0;

      // Get category names for breakdown
      const categoryIds = categoryStats
        .map((s: any) => s.categoryId)
        .filter(Boolean);
      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));
      const categoryBreakdown = categoryStats.map((stat: any) => ({
        category: categoryMap.get(stat.categoryId!) || 'Uncategorized',
        amount: Math.abs(stat._sum.amount || 0),
        percentage:
          totalExpenses > 0
            ? (Math.abs(stat._sum.amount || 0) / totalExpenses) * 100
            : 0,
      }));

      return {
        totalIncome,
        totalExpenses,
        netAmount,
        transactionCount,
        averageTransaction,
        categoryBreakdown,
      };
    } catch (error) {
      throw new Error(`Failed to get transaction stats: ${error}`);
    }
  }

  /**
   * Bulk create transactions
   */
  static async bulkCreate(
    transactions: CreateTransactionInput[]
  ): Promise<TransactionWithRelations[]> {
    try {
      const validatedTransactions = transactions.map(t =>
        CreateTransactionSchema.parse(t)
      );

      const result = await prisma.$transaction(
        validatedTransactions.map(transaction =>
          prisma.transaction.create({
            data: transaction,
            include: {
              account: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          })
        )
      );

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      throw new Error(`Failed to bulk create transactions: ${error}`);
    }
  }

  /**
   * Search transactions
   */
  static async search(
    query: string,
    userId: string,
    limit: number = 10
  ): Promise<TransactionWithRelations[]> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          OR: [
            { description: { contains: query, mode: 'insensitive' } },
            { account: { name: { contains: query, mode: 'insensitive' } } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
          ],
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: limit,
      });

      return transactions;
    } catch (error) {
      throw new Error(`Failed to search transactions: ${error}`);
    }
  }
}
