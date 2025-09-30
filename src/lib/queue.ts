import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

// Redis connection - only connect if Redis URL is provided
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// Job types
export interface TransactionSyncJob {
  userId: string;
  accessToken: string;
  startDate: string;
  endDate: string;
}

export interface ReconciliationJob {
  userId: string;
  provider: 'plaid' | 'stripe' | 'paystack' | 'flutterwave';
  accountId?: string;
  startDate: string;
  endDate: string;
}

export interface WebhookProcessingJob {
  eventId: string;
  provider: string;
  eventType: string;
  payload: any;
}

export interface AICategorizationJob {
  transactionId: string;
  description: string;
  amount: number;
  userId: string;
}

// Queue definitions - only create if Redis is available
export const transactionSyncQueue = redis
  ? new Queue<TransactionSyncJob>('transaction-sync', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    })
  : null;

export const reconciliationQueue = redis
  ? new Queue<ReconciliationJob>('reconciliation', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    })
  : null;

export const webhookProcessingQueue = redis
  ? new Queue<WebhookProcessingJob>('webhook-processing', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 100,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    })
  : null;

export const aiCategorizationQueue = redis
  ? new Queue<AICategorizationJob>('ai-categorization', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 500,
        removeOnFail: 100,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1000,
        },
      },
    })
  : null;

// Job processors
export class QueueProcessors {
  // Transaction Sync Processor
  static async processTransactionSync(job: Job<TransactionSyncJob>) {
    const { userId, accessToken, startDate, endDate } = job.data;

    try {
      console.log(`Processing transaction sync for user ${userId}`);

      // Import PlaidService dynamically to avoid circular dependencies
      const { PlaidService } = await import('./plaid-service');

      // Get all transactions from Plaid
      const transactions = await PlaidService.getAllTransactions(
        accessToken,
        startDate,
        endDate
      );

      // Process each transaction
      for (const transaction of transactions) {
        // Add AI categorization job
        if (aiCategorizationQueue) {
          await aiCategorizationQueue.add('categorize-transaction', {
            transactionId: transaction.transaction_id,
            description: transaction.name,
            amount: transaction.amount,
            userId,
          });
        }
      }

      console.log(
        `Synced ${transactions.length} transactions for user ${userId}`
      );

      // Update job progress
      await job.updateProgress(100);
    } catch (error) {
      console.error(`Transaction sync failed for user ${userId}:`, error);
      throw error;
    }
  }

  // Reconciliation Processor
  static async processReconciliation(job: Job<ReconciliationJob>) {
    const { userId, provider, accountId, startDate, endDate } = job.data;
    let jobId: string | undefined;
    let MongoService: any;

    try {
      console.log(
        `Processing reconciliation for user ${userId}, provider ${provider}`
      );

      // Import MongoDBService
      const { MongoDBService } = await import('./mongodb-models');
      MongoService = MongoDBService;

      // Create reconciliation job record
      jobId = await MongoService.createReconciliationJob({
        userId,
        provider,
        status: 'processing',
        recordsProcessed: 0,
        recordsMatched: 0,
        recordsUnmatched: 0,
      });

      let recordsProcessed = 0;
      let recordsMatched = 0;
      let recordsUnmatched = 0;

      // Process reconciliation based on provider
      switch (provider) {
        case 'plaid':
          // Reconcile Plaid transactions with our database
          const { PlaidService } = await import('./plaid-service');
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient();

          try {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { plaidAccessToken: true },
            });

            if (user?.plaidAccessToken) {
              const transactions = await PlaidService.getAllTransactions(
                user.plaidAccessToken,
                startDate,
                endDate
              );

              for (const transaction of transactions) {
                recordsProcessed++;

                const existingTransaction = await prisma.transaction.findFirst({
                  where: { plaidTransactionId: transaction.transaction_id },
                });

                if (existingTransaction) {
                  recordsMatched++;
                } else {
                  recordsUnmatched++;
                  // Create new transaction record
                  await prisma.transaction.create({
                    data: {
                      amount: transaction.amount,
                      description: transaction.name,
                      date: new Date(transaction.date),
                      type: transaction.amount > 0 ? 'INCOME' : 'EXPENSE',
                      userId,
                      accountId:
                        (
                          await prisma.account.findFirst({
                            where: { plaidAccountId: transaction.account_id },
                          })
                        )?.id || '',
                      plaidTransactionId: transaction.transaction_id,
                      plaidAccountId: transaction.account_id,
                    },
                  });
                }
              }
            }
          } finally {
            await prisma.$disconnect();
          }
          break;

        case 'stripe':
          // Reconcile Stripe payments
          // Implementation for Stripe reconciliation
          break;

        case 'paystack':
        case 'flutterwave':
          // Reconcile Nigerian payment providers
          // Implementation for Nigerian payment reconciliation
          break;
      }

      // Update reconciliation job
      await MongoService.updateReconciliationJob(jobId, {
        status: 'completed',
        completedAt: new Date(),
        recordsProcessed,
        recordsMatched,
        recordsUnmatched,
      });

      console.log(
        `Reconciliation completed for user ${userId}: ${recordsProcessed} processed, ${recordsMatched} matched, ${recordsUnmatched} unmatched`
      );
    } catch (error) {
      console.error(`Reconciliation failed for user ${userId}:`, error);

      // Update job status to failed
      if (jobId) {
        try {
          await MongoService.updateReconciliationJob(jobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        } catch (updateError) {
          console.error(
            'Failed to update reconciliation job status:',
            updateError
          );
        }
      }

      throw error;
    }
  }

  // Webhook Processing Processor
  static async processWebhook(job: Job<WebhookProcessingJob>) {
    const { eventId, provider, eventType, payload } = job.data;

    try {
      console.log(`Processing webhook: ${provider} - ${eventType}`);

      // Import MongoDBService
      const { MongoDBService } = await import('./mongodb-models');

      // Process webhook based on provider and event type
      switch (provider) {
        case 'plaid':
          await this.processPlaidWebhook(eventType, payload);
          break;
        case 'stripe':
          await this.processStripeWebhook(eventType, payload);
          break;
        case 'paystack':
          await this.processPaystackWebhook(eventType, payload);
          break;
        case 'flutterwave':
          await this.processFlutterwaveWebhook(eventType, payload);
          break;
        default:
          console.warn(`Unknown webhook provider: ${provider}`);
      }

      // Mark webhook as processed
      await MongoDBService.markWebhookProcessed(eventId);
    } catch (error) {
      console.error(
        `Webhook processing failed for ${provider} - ${eventType}:`,
        error
      );

      // Mark webhook as processed with error
      const { MongoDBService } = await import('./mongodb-models');
      await MongoDBService.markWebhookProcessed(
        eventId,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }

  // AI Categorization Processor
  static async processAICategorization(job: Job<AICategorizationJob>) {
    const { transactionId, description, amount, userId } = job.data;

    try {
      console.log(
        `Processing AI categorization for transaction ${transactionId}`
      );

      // Import AI service
      const { AIService } = await import('./ai-service');

      // Categorize transaction
      const categorization = await AIService.categorizeTransaction(
        description,
        amount
      );

      // Update transaction in database
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      try {
        await prisma.transaction.updateMany({
          where: { plaidTransactionId: transactionId },
          data: {
            aiCategory: categorization.category,
            aiConfidence: categorization.confidence,
            aiTags: categorization.tags,
          },
        });
      } finally {
        await prisma.$disconnect();
      }

      // Log AI prompt usage
      const { MongoDBService } = await import('./mongodb-models');
      await MongoDBService.saveAIPrompt({
        userId,
        prompt: `Categorize transaction: ${description} - $${amount}`,
        response: JSON.stringify(categorization),
        model: 'gpt-3.5-turbo',
        tokens: 100, // Estimate
        cost: 0.0001, // Estimate
        timestamp: new Date(),
        category: 'transaction_categorization',
        metadata: {
          transactionId,
          confidence: categorization.confidence,
        },
      });
    } catch (error) {
      console.error(
        `AI categorization failed for transaction ${transactionId}:`,
        error
      );
      throw error;
    }
  }

  // Webhook processors for different providers
  private static async processPlaidWebhook(eventType: string, payload: any) {
    console.log(`Processing Plaid webhook: ${eventType}`);
    // Implementation for Plaid webhooks
  }

  private static async processStripeWebhook(eventType: string, payload: any) {
    console.log(`Processing Stripe webhook: ${eventType}`);
    // Implementation for Stripe webhooks
  }

  private static async processPaystackWebhook(eventType: string, payload: any) {
    console.log(`Processing Paystack webhook: ${eventType}`);
    // Implementation for Paystack webhooks
  }

  private static async processFlutterwaveWebhook(
    eventType: string,
    payload: any
  ) {
    console.log(`Processing Flutterwave webhook: ${eventType}`);
    // Implementation for Flutterwave webhooks
  }
}

// Worker initialization
export function initializeWorkers() {
  if (!redis) {
    console.log('Redis not configured, skipping worker initialization');
    return;
  }

  // Transaction Sync Worker
  new Worker('transaction-sync', QueueProcessors.processTransactionSync, {
    connection: redis,
    concurrency: 5,
  });

  // Reconciliation Worker
  new Worker('reconciliation', QueueProcessors.processReconciliation, {
    connection: redis,
    concurrency: 3,
  });

  // Webhook Processing Worker
  new Worker('webhook-processing', QueueProcessors.processWebhook, {
    connection: redis,
    concurrency: 10,
  });

  // AI Categorization Worker
  new Worker('ai-categorization', QueueProcessors.processAICategorization, {
    connection: redis,
    concurrency: 20,
  });

  console.log('All workers initialized');
}

// Queue management functions
export class QueueManager {
  static async addTransactionSync(
    userId: string,
    accessToken: string,
    startDate: string,
    endDate: string
  ) {
    if (!redis) {
      console.log('Redis not configured, skipping queue operation');
      return;
    }
    return await transactionSyncQueue?.add('sync-transactions', {
      userId,
      accessToken,
      startDate,
      endDate,
    });
  }

  static async addReconciliation(
    userId: string,
    provider: string,
    accountId?: string,
    startDate?: string,
    endDate?: string
  ) {
    if (!redis) {
      console.log('Redis not configured, skipping queue operation');
      return;
    }
    return await reconciliationQueue?.add('reconcile-accounts', {
      userId,
      provider: provider as any,
      accountId,
      startDate:
        startDate ||
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
    });
  }

  static async addWebhookProcessing(
    eventId: string,
    provider: string,
    eventType: string,
    payload: any
  ) {
    if (!redis) {
      console.log('Redis not configured, skipping queue operation');
      return;
    }
    return await webhookProcessingQueue?.add('process-webhook', {
      eventId,
      provider,
      eventType,
      payload,
    });
  }

  static async addAICategorization(
    transactionId: string,
    description: string,
    amount: number,
    userId: string
  ) {
    if (!redis) {
      console.log('Redis not configured, skipping queue operation');
      return;
    }
    return await aiCategorizationQueue?.add('categorize-transaction', {
      transactionId,
      description,
      amount,
      userId,
    });
  }

  static async getQueueStats() {
    if (!redis) {
      return {
        transactionSync: { waiting: 0, active: 0, completed: 0, failed: 0 },
        reconciliation: { waiting: 0, active: 0, completed: 0, failed: 0 },
        webhookProcessing: { waiting: 0, active: 0, completed: 0, failed: 0 },
        aiCategorization: { waiting: 0, active: 0, completed: 0, failed: 0 },
      };
    }
    return {
      transactionSync: (await transactionSyncQueue?.getJobCounts()) || {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      reconciliation: (await reconciliationQueue?.getJobCounts()) || {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      webhookProcessing: (await webhookProcessingQueue?.getJobCounts()) || {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
      aiCategorization: (await aiCategorizationQueue?.getJobCounts()) || {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      },
    };
  }
}
