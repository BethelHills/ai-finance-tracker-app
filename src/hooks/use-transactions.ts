'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  CreateTransactionData,
  TransactionFilters,
} from '@/types/transaction';
import {
  filterTransactions,
  sortTransactions,
  calculateTransactionStats,
} from '@/lib/transaction-utils';

const STORAGE_KEY = 'ai-finance-tracker-transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    category: 'ALL',
    type: 'ALL',
    dateRange: {
      start: '',
      end: '',
    },
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>(
    'date'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        setTransactions(parsed);
      } catch (error) {
        console.error('Error loading transactions from localStorage:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Add a new transaction
  const addTransaction = useCallback((data: CreateTransactionData) => {
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  // Update an existing transaction
  const updateTransaction = useCallback(
    (id: string, data: Partial<CreateTransactionData>) => {
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id
            ? { ...transaction, ...data, updatedAt: new Date().toISOString() }
            : transaction
        )
      );
    },
    []
  );

  // Delete a transaction
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  }, []);

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<TransactionFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'ALL',
      type: 'ALL',
      dateRange: {
        start: '',
        end: '',
      },
    });
  }, []);

  // Get filtered and sorted transactions
  const filteredTransactions = filterTransactions(transactions, filters);
  const sortedTransactions = sortTransactions(
    filteredTransactions,
    sortBy,
    sortOrder
  );

  // Calculate statistics
  const stats = calculateTransactionStats(transactions);

  return {
    transactions: sortedTransactions,
    allTransactions: transactions,
    filters,
    sortBy,
    sortOrder,
    stats,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateFilters,
    clearFilters,
    setSortBy,
    setSortOrder,
  };
}
