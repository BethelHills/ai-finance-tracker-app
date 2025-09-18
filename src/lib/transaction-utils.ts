import {
  Transaction,
  TransactionStats,
  TransactionFilters,
} from '@/types/transaction';

export const generateTransactionId = (): string => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] => {
  return transactions.filter(transaction => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower) ||
        (transaction.note &&
          transaction.note.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'ALL') {
      if (transaction.category !== filters.category) return false;
    }

    // Type filter
    if (filters.type && filters.type !== 'ALL') {
      if (transaction.type !== filters.type) return false;
    }

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (transactionDate < startDate || transactionDate > endDate)
        return false;
    }

    return true;
  });
};

export const calculateTransactionStats = (
  transactions: Transaction[]
): TransactionStats => {
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;
  const transactionCount = transactions.length;

  // Calculate category breakdown
  const categoryMap = new Map<string, number>();
  transactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(
    ([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    })
  );

  return {
    totalIncome,
    totalExpenses,
    netAmount,
    transactionCount,
    categoryBreakdown: categoryBreakdown.sort((a, b) => b.amount - a.amount),
  };
};

export const sortTransactions = (
  transactions: Transaction[],
  sortBy: 'date' | 'amount' | 'description' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = Math.abs(a.amount) - Math.abs(b.amount);
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

export const getTransactionCategories = (): string[] => {
  return [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Education',
    'Salary',
    'Freelance',
    'Investment',
    'Other',
  ];
};
