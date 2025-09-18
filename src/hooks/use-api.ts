'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  apiClient,
  TransactionQuery,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/lib/api-client';

// Base hook for API operations
export function useAPI<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { enabled = true, refetchOnMount = true, refetchInterval } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, enabled]);

  useEffect(() => {
    if (refetchOnMount) {
      fetchData();
    }
  }, [fetchData, refetchOnMount]);

  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Transaction hooks
export function useTransactions(query: Partial<TransactionQuery> = {}) {
  const apiCall = useCallback(() => {
    if (!query.userId) {
      throw new Error('userId is required for useTransactions');
    }
    return apiClient.getTransactions(query as TransactionQuery);
  }, [query]);

  return useAPI(apiCall, [query], {
    enabled: !!query.userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useTransaction(id: string) {
  const apiCall = useCallback(() => apiClient.getTransaction(id), [id]);

  return useAPI(apiCall, [id], {
    enabled: !!id,
  });
}

export function useTransactionStats(startDate?: string, endDate?: string) {
  const apiCall = useCallback(
    () => apiClient.getTransactionStats(startDate, endDate),
    [startDate, endDate]
  );

  return useAPI(apiCall, [startDate, endDate], {
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useTransactionMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTransaction = useCallback(
    async (data: CreateTransactionInput) => {
      setIsCreating(true);
      setError(null);

      try {
        const result = await apiClient.createTransaction(data);
        return result;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to create transaction');
        setError(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateTransaction = useCallback(
    async (id: string, data: UpdateTransactionInput) => {
      setIsUpdating(true);
      setError(null);

      try {
        const result = await apiClient.updateTransaction(id, data);
        return result;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to update transaction');
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await apiClient.deleteTransaction(id);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete transaction');
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating,
    isUpdating,
    isDeleting,
    error,
  };
}

// AI hooks
export function useAICategorization() {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const categorizeTransaction = useCallback(
    async (description: string, amount: number) => {
      setIsCategorizing(true);
      setError(null);

      try {
        const result = await apiClient.categorizeTransaction(
          description,
          amount
        );
        return result;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to categorize transaction');
        setError(error);
        throw error;
      } finally {
        setIsCategorizing(false);
      }
    },
    []
  );

  return {
    categorizeTransaction,
    isCategorizing,
    error,
  };
}

export function useAIInsights() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateInsights = useCallback(async (data: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await apiClient.generateInsights(data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to generate insights');
      setError(error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateInsights,
    isGenerating,
    error,
  };
}

export function useBudgetOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optimizeBudget = useCallback(
    async (
      currentSpending: Record<string, number>,
      income: number,
      goals: string[]
    ) => {
      setIsOptimizing(true);
      setError(null);

      try {
        const result = await apiClient.optimizeBudget(
          currentSpending,
          income,
          goals
        );
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to optimize budget');
        setError(error);
        throw error;
      } finally {
        setIsOptimizing(false);
      }
    },
    []
  );

  return {
    optimizeBudget,
    isOptimizing,
    error,
  };
}

// Account hooks
export function useAccounts() {
  const apiCall = useCallback(() => apiClient.getAccounts(), []);

  return useAPI(apiCall, [], {
    refetchInterval: 60000, // Refetch every minute
  });
}

// Category hooks
export function useCategories() {
  const apiCall = useCallback(() => apiClient.getCategories(), []);

  return useAPI(apiCall, [], {
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// Budget hooks
export function useBudgets() {
  const apiCall = useCallback(() => apiClient.getBudgets(), []);

  return useAPI(apiCall, [], {
    refetchInterval: 60000, // Refetch every minute
  });
}

// Goal hooks
export function useGoals() {
  const apiCall = useCallback(() => apiClient.getGoals(), []);

  return useAPI(apiCall, [], {
    refetchInterval: 60000, // Refetch every minute
  });
}

// Search hook
export function useTransactionSearch() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);

  const searchTransactions = useCallback(
    async (query: string, limit: number = 10) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await apiClient.searchTransactions(query, limit);
        setSearchResults(results);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Search failed');
        setSearchError(error);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    searchTransactions,
    clearSearch,
  };
}

// Cache management hook
export function useAPICache() {
  const clearCache = useCallback(() => {
    apiClient.clearCache();
  }, []);

  const setApiKey = useCallback((apiKey: string) => {
    apiClient.setApiKey(apiKey);
  }, []);

  return {
    clearCache,
    setApiKey,
  };
}
