import { getCollection } from './mongodb';

export interface AIPrompt {
  _id?: string;
  userId: string;
  prompt: string;
  response: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: Date;
  category: 'transaction_categorization' | 'insights' | 'recommendations' | 'other';
  metadata?: Record<string, any>;
}

export interface UserNote {
  _id?: string;
  userId: string;
  transactionId?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
}

export interface WebhookEvent {
  _id?: string;
  provider: 'plaid' | 'stripe' | 'paystack' | 'flutterwave';
  eventType: string;
  payload: Record<string, any>;
  processed: boolean;
  processedAt?: Date;
  error?: string;
  retryCount: number;
  createdAt: Date;
}

export interface ReconciliationJob {
  _id?: string;
  userId: string;
  provider: 'plaid' | 'stripe' | 'paystack' | 'flutterwave';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  recordsProcessed: number;
  recordsMatched: number;
  recordsUnmatched: number;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  _id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// MongoDB collection helpers
export class MongoDBService {
  // AI Prompts
  static async saveAIPrompt(prompt: AIPrompt): Promise<string> {
    const collection = await getCollection('ai_prompts');
    const result = await collection.insertOne({
      ...prompt,
      timestamp: new Date(),
    });
    return result.insertedId.toString();
  }

  static async getAIPrompts(userId: string, limit = 50): Promise<AIPrompt[]> {
    const collection = await getCollection('ai_prompts');
    return await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray() as AIPrompt[];
  }

  static async getAIPromptStats(userId: string, startDate: Date, endDate: Date) {
    const collection = await getCollection('ai_prompts');
    const pipeline = [
      {
        $match: {
          userId,
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalTokens: { $sum: '$tokens' },
          totalCost: { $sum: '$cost' }
        }
      }
    ];
    return await collection.aggregate(pipeline).toArray();
  }

  // User Notes
  static async createNote(note: Omit<UserNote, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const collection = await getCollection('user_notes');
    const now = new Date();
    const result = await collection.insertOne({
      ...note,
      createdAt: now,
      updatedAt: now,
    });
    return result.insertedId.toString();
  }

  static async updateNote(noteId: string, updates: Partial<UserNote>): Promise<boolean> {
    const collection = await getCollection('user_notes');
    const result = await collection.updateOne(
      { _id: noteId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  static async getNotes(userId: string, transactionId?: string): Promise<UserNote[]> {
    const collection = await getCollection('user_notes');
    const query: any = { userId };
    if (transactionId) {
      query.transactionId = transactionId;
    }
    return await collection
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray() as UserNote[];
  }

  static async deleteNote(noteId: string): Promise<boolean> {
    const collection = await getCollection('user_notes');
    const result = await collection.deleteOne({ _id: noteId });
    return result.deletedCount > 0;
  }

  // Webhook Events
  static async saveWebhookEvent(event: Omit<WebhookEvent, '_id' | 'createdAt'>): Promise<string> {
    const collection = await getCollection('webhook_events');
    const result = await collection.insertOne({
      ...event,
      createdAt: new Date(),
    });
    return result.insertedId.toString();
  }

  static async getUnprocessedWebhooks(): Promise<WebhookEvent[]> {
    const collection = await getCollection('webhook_events');
    return await collection
      .find({ processed: false, retryCount: { $lt: 3 } })
      .sort({ createdAt: 1 })
      .toArray() as WebhookEvent[];
  }

  static async markWebhookProcessed(eventId: string, error?: string): Promise<boolean> {
    const collection = await getCollection('webhook_events');
    const update: any = {
      processed: true,
      processedAt: new Date(),
    };
    
    if (error) {
      update.error = error;
      update.$inc = { retryCount: 1 };
    }

    const result = await collection.updateOne(
      { _id: eventId },
      update
    );
    return result.modifiedCount > 0;
  }

  // Reconciliation Jobs
  static async createReconciliationJob(job: Omit<ReconciliationJob, '_id' | 'startedAt'>): Promise<string> {
    const collection = await getCollection('reconciliation_jobs');
    const result = await collection.insertOne({
      ...job,
      startedAt: new Date(),
    });
    return result.insertedId.toString();
  }

  static async updateReconciliationJob(jobId: string, updates: Partial<ReconciliationJob>): Promise<boolean> {
    const collection = await getCollection('reconciliation_jobs');
    const result = await collection.updateOne(
      { _id: jobId },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }

  static async getReconciliationJobs(userId: string, limit = 20): Promise<ReconciliationJob[]> {
    const collection = await getCollection('reconciliation_jobs');
    return await collection
      .find({ userId })
      .sort({ startedAt: -1 })
      .limit(limit)
      .toArray() as ReconciliationJob[];
  }

  // Audit Logs
  static async logAuditEvent(event: Omit<AuditLog, '_id' | 'timestamp'>): Promise<string> {
    const collection = await getCollection('audit_logs');
    const result = await collection.insertOne({
      ...event,
      timestamp: new Date(),
    });
    return result.insertedId.toString();
  }

  static async getAuditLogs(userId: string, limit = 100): Promise<AuditLog[]> {
    const collection = await getCollection('audit_logs');
    return await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray() as AuditLog[];
  }

  // Analytics and Reporting
  static async getTransactionInsights(userId: string, startDate: Date, endDate: Date) {
    const collection = await getCollection('ai_prompts');
    const pipeline = [
      {
        $match: {
          userId,
          category: 'transaction_categorization',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPrompts: { $sum: 1 },
          totalTokens: { $sum: '$tokens' },
          totalCost: { $sum: '$cost' },
          avgConfidence: { $avg: '$metadata.confidence' }
        }
      }
    ];
    return await collection.aggregate(pipeline).toArray();
  }
}
