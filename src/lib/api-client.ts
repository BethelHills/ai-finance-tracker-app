import { z } from 'zod';

// Base configuration
export interface APIClientConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

// Base API client class
export class APIClient {
  private config: Required<APIClientConfig>;
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(config: APIClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      apiKey: config.apiKey || '',
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      cache: config.cache || false,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;

    // Check cache
    if (useCache && this.config.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 300000) {
        // 5 minutes
        return cached.data;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code,
          errorData.details
        );
      }

      const data = await response.json();

      // Cache successful responses
      if (useCache && this.config.cache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, 'TIMEOUT');
      }

      throw new APIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // Transaction operations
  async createTransaction(
    data: CreateTransactionInput
  ): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransaction(id: string): Promise<TransactionResponse> {
    return this.request<TransactionResponse>(
      `/api/transactions/${id}`,
      {
        method: 'GET',
      },
      true
    ); // Use cache
  }

  async getTransactions(
    query: Partial<TransactionQuery> = {}
  ): Promise<PaginatedTransactionsResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    return this.request<PaginatedTransactionsResponse>(
      `/api/transactions?${params}`,
      {
        method: 'GET',
      },
      true
    ); // Use cache
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionInput
  ): Promise<TransactionResponse> {
    return this.request<TransactionResponse>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async searchTransactions(
    query: string,
    limit: number = 10
  ): Promise<TransactionResponse[]> {
    return this.request<TransactionResponse[]>(
      `/api/transactions/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
      }
    );
  }

  async getTransactionStats(
    startDate?: string,
    endDate?: string
  ): Promise<TransactionStatsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request<TransactionStatsResponse>(
      `/api/transactions/stats?${params}`,
      {
        method: 'GET',
      },
      true
    ); // Use cache
  }

  // AI operations
  async categorizeTransaction(
    description: string,
    amount: number
  ): Promise<CategorizationResponse> {
    return this.request<CategorizationResponse>('/api/ai/categorize', {
      method: 'POST',
      body: JSON.stringify({ description, amount }),
    });
  }

  async generateInsights(data: FinancialData): Promise<InsightsResponse> {
    return this.request<InsightsResponse>('/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async optimizeBudget(
    currentSpending: Record<string, number>,
    income: number,
    goals: string[]
  ): Promise<BudgetOptimizationResponse> {
    return this.request<BudgetOptimizationResponse>(
      '/api/ai/budget-recommendations',
      {
        method: 'POST',
        body: JSON.stringify({ currentSpending, income, goals }),
      }
    );
  }

  // Account operations
  async getAccounts(): Promise<AccountResponse[]> {
    return this.request<AccountResponse[]>(
      '/api/accounts',
      {
        method: 'GET',
      },
      true
    ); // Use cache
  }

  async createAccount(data: CreateAccountInput): Promise<AccountResponse> {
    return this.request<AccountResponse>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Category operations
  async getCategories(): Promise<CategoryResponse[]> {
    return this.request<CategoryResponse[]>(
      '/api/categories',
      {
        method: 'GET',
      },
      true
    ); // Use cache
  }

  async createCategory(data: CreateCategoryInput): Promise<CategoryResponse> {
    return this.request<CategoryResponse>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Budget operations
  async getBudgets(): Promise<BudgetResponse[]> {
    return this.request<BudgetResponse[]>(
      '/api/budgets',
      {
        method: 'GET',
      },
      true
    ); // Use cache
  }

  async createBudget(data: CreateBudgetInput): Promise<BudgetResponse> {
    return this.request<BudgetResponse>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Goal operations
  async getGoals(): Promise<GoalResponse[]> {
    return this.request<GoalResponse[]>(
      '/api/goals',
      {
        method: 'GET',
      },
      true
    ); // Use cache
  }

  async createGoal(data: CreateGoalInput): Promise<GoalResponse> {
    return this.request<GoalResponse>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }
}

// TypeScript types (generated from schema)
export interface CreateTransactionInput {
  amount: number;
  description: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string;
  accountId: string;
  userId: string;
  isRecurring?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionInput {
  amount?: number;
  description?: string;
  date?: string;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string;
  accountId?: string;
  isRecurring?: boolean;
  metadata?: Record<string, any>;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string;
  accountId?: string;
  userId: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'description';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionResponse {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string;
  accountId: string;
  userId: string;
  isRecurring: boolean;
  metadata?: Record<string, any>;
  aiCategory?: string;
  aiConfidence?: number;
  aiTags?: string[];
  createdAt: string;
  updatedAt: string;
  account: {
    id: string;
    name: string;
    type: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface PaginatedTransactionsResponse {
  data: TransactionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TransactionStatsResponse {
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

export interface CategorizationResponse {
  category: string;
  confidence: number;
  tags: string[];
}

export interface InsightsResponse {
  insights: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    recommendation: string;
    confidence: number;
  }>;
}

export interface BudgetOptimizationResponse {
  recommendedBudgets: Record<string, number>;
  reasoning: string;
  savingsPotential: number;
}

export interface FinancialData {
  transactions: Array<{
    amount: number;
    description: string;
    category: string;
    date: string;
  }>;
  budgets: Array<{
    name: string;
    amount: number;
    spent: number;
    period: string;
  }>;
  goals: Array<{
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }>;
}

// Account types
export interface CreateAccountInput {
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'CASH' | 'LOAN';
  balance: number;
  currency: string;
  userId: string;
}

export interface AccountResponse {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface CreateCategoryInput {
  name: string;
  color: string;
  icon?: string;
  parentId?: string;
  userId: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  icon?: string;
  parentId?: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Budget types
export interface CreateBudgetInput {
  name: string;
  amount: number;
  period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  categoryId?: string;
  userId: string;
}

export interface BudgetResponse {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: string;
  startDate: string;
  endDate: string;
  categoryId?: string;
  userId: string;
  isActive: boolean;
  aiRecommendations?: string;
  aiAlerts?: string[];
  createdAt: string;
  updatedAt: string;
}

// Goal types
export interface CreateGoalInput {
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  type:
    | 'EMERGENCY_FUND'
    | 'VACATION'
    | 'HOME_PURCHASE'
    | 'RETIREMENT'
    | 'DEBT_PAYOFF'
    | 'INVESTMENT'
    | 'CUSTOM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  userId: string;
}

export interface GoalResponse {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  type: string;
  priority: string;
  isCompleted: boolean;
  aiProgressAnalysis?: string;
  aiRecommendations?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Create and export the API client instance
export const apiClient = new APIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  timeout: 10000,
  retries: 3,
  cache: true,
});
