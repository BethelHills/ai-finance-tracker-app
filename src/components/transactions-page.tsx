'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionTable } from '@/components/transaction-table';
import {
  TransactionStatsComponent,
  CategoryBreakdown,
} from '@/components/transaction-stats';
import { CreateTransactionData, Transaction } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TransactionsPage() {
  const {
    transactions,
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
  } = useTransactions();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const { success, error } = useToast();

  const handleAddTransaction = (data: CreateTransactionData) => {
    try {
      addTransaction(data);
      success('Transaction added successfully!');
      setShowForm(false);
    } catch (err) {
      error('Failed to add transaction. Please try again.');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleUpdateTransaction = (data: CreateTransactionData) => {
    if (editingTransaction) {
      try {
        updateTransaction(editingTransaction.id, data);
        success('Transaction updated successfully!');
        setEditingTransaction(null);
        setShowForm(false);
      } catch (err) {
        error('Failed to update transaction. Please try again.');
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        deleteTransaction(id);
        success('Transaction deleted successfully!');
      } catch (err) {
        error('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleSortChange = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Transactions</h1>
          <p className='text-muted-foreground'>
            Manage your income and expenses
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className='flex items-center space-x-2'
        >
          <Plus className='h-4 w-4' />
          <span>Add Transaction</span>
        </Button>
      </div>

      {/* Statistics */}
      <TransactionStatsComponent stats={stats} />

      {/* Category Breakdown */}
      <CategoryBreakdown stats={stats} />

      {/* Transaction Form */}
      {showForm && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <Button variant='ghost' size='sm' onClick={handleCancelForm}>
              <X className='h-4 w-4' />
            </Button>
          </div>
          <TransactionForm
            onSubmit={
              editingTransaction
                ? handleUpdateTransaction
                : handleAddTransaction
            }
            onCancel={handleCancelForm}
            isOpen={showForm}
            onOpenChange={setShowForm}
          />
        </div>
      )}

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
