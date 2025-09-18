'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction, TransactionFilters } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/transaction-utils';
import { useUserSettings } from '@/contexts/user-settings-context';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: Partial<TransactionFilters>) => void;
  onClearFilters: () => void;
  sortBy: 'date' | 'amount' | 'description';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'date' | 'amount' | 'description') => void;
}

const categories = [
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

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  filters,
  onFiltersChange,
  onClearFilters,
  sortBy,
  sortOrder,
  onSortChange,
}: TransactionTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { settings } = useUserSettings();

  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      onSortChange(field); // This would toggle sort order in parent
    } else {
      onSortChange(field);
    }
  };

  const getTypeColor = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? 'text-green-600' : 'text-red-600';
  };

  const getTypeBadgeColor = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const activeFiltersCount = [
    filters.search,
    filters.category !== 'ALL',
    filters.type !== 'ALL',
    filters.dateRange.start,
    filters.dateRange.end,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Transactions</CardTitle>
            <p className='text-sm text-muted-foreground'>
              {transactions.length} transaction
              {transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            {activeFiltersCount > 0 && (
              <Badge variant='secondary'>
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className='h-4 w-4 mr-2' />
              Filters
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search transactions...'
            value={filters.search}
            onChange={e => onFiltersChange({ search: e.target.value })}
            className='pl-10'
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className='space-y-4 pt-4 border-t'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Category</label>
                <Select
                  value={filters.category}
                  onValueChange={value => onFiltersChange({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All categories' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Type</label>
                <Select
                  value={filters.type}
                  onValueChange={value =>
                    onFiltersChange({
                      type: value as 'ALL' | 'INCOME' | 'EXPENSE',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All types' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Types</SelectItem>
                    <SelectItem value='INCOME'>Income</SelectItem>
                    <SelectItem value='EXPENSE'>Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Date Range</label>
                <div className='flex space-x-2'>
                  <Input
                    type='date'
                    placeholder='Start date'
                    value={filters.dateRange.start}
                    onChange={e =>
                      onFiltersChange({
                        dateRange: {
                          ...filters.dateRange,
                          start: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    type='date'
                    placeholder='End date'
                    value={filters.dateRange.end}
                    onChange={e =>
                      onFiltersChange({
                        dateRange: {
                          ...filters.dateRange,
                          end: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className='flex justify-end'>
                <Button variant='ghost' size='sm' onClick={onClearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {transactions.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-muted-foreground'>No transactions found</p>
            {activeFiltersCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onClearFilters}
                className='mt-2'
              >
                Clear filters to see all transactions
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Table Header */}
            <div className='grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b'>
              <div className='col-span-4'>Description</div>
              <div className='col-span-2'>Category</div>
              <div className='col-span-2'>
                <button
                  onClick={() => handleSort('date')}
                  className='flex items-center space-x-1 hover:text-foreground'
                >
                  <span>Date</span>
                  <ArrowUpDown className='h-3 w-3' />
                </button>
              </div>
              <div className='col-span-2'>
                <button
                  onClick={() => handleSort('amount')}
                  className='flex items-center space-x-1 hover:text-foreground'
                >
                  <span>Amount</span>
                  <ArrowUpDown className='h-3 w-3' />
                </button>
              </div>
              <div className='col-span-2'>Actions</div>
            </div>

            {/* Table Rows */}
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                className='grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors'
              >
                <div className='col-span-4'>
                  <div className='font-medium'>{transaction.description}</div>
                  {transaction.note && (
                    <div className='text-sm text-muted-foreground mt-1'>
                      {transaction.note}
                    </div>
                  )}
                </div>

                <div className='col-span-2'>
                  <Badge variant='outline' className='text-xs'>
                    {transaction.category}
                  </Badge>
                </div>

                <div className='col-span-2 text-sm text-muted-foreground'>
                  {formatDate(transaction.date)}
                </div>

                <div className='col-span-2'>
                  <div className='flex items-center space-x-2'>
                    <Badge className={getTypeBadgeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                    <span
                      className={`font-medium ${getTypeColor(transaction.type)}`}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(
                        Math.abs(transaction.amount),
                        settings.currency
                      )}
                    </span>
                  </div>
                </div>

                <div className='col-span-2'>
                  <div className='flex items-center space-x-1'>
                    {onEdit && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onEdit(transaction)}
                        className='h-8 w-8 p-0'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onDelete(transaction.id)}
                        className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    )}
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <MoreHorizontal className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
