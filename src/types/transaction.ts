export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  amount: number;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  note?: string;
}

export interface TransactionFilters {
  search: string;
  category: string;
  type: 'ALL' | 'INCOME' | 'EXPENSE';
  dateRange: {
    start: string;
    end: string;
  };
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}
