'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';
import { TransactionStats } from '@/types/transaction';
import { formatCurrency } from '@/lib/transaction-utils';
import { useUserSettings } from '@/contexts/user-settings-context';

interface TransactionStatsProps {
  stats: TransactionStats;
}

export function TransactionStatsComponent({ stats }: TransactionStatsProps) {
  const { settings } = useUserSettings();
  const isPositive = stats.netAmount >= 0;

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Total Income */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Income</CardTitle>
          <TrendingUp className='h-4 w-4 text-green-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {formatCurrency(stats.totalIncome, settings.currency)}
          </div>
          <p className='text-xs text-muted-foreground'>
            All income transactions
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Expenses</CardTitle>
          <TrendingDown className='h-4 w-4 text-red-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-red-600'>
            {formatCurrency(stats.totalExpenses, settings.currency)}
          </div>
          <p className='text-xs text-muted-foreground'>
            All expense transactions
          </p>
        </CardContent>
      </Card>

      {/* Net Amount */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Net Amount</CardTitle>
          <DollarSign className='h-4 w-4 text-blue-600' />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(stats.netAmount, settings.currency)}
          </div>
          <p className='text-xs text-muted-foreground'>
            {isPositive ? 'You have a surplus' : 'You have a deficit'}
          </p>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Transactions</CardTitle>
          <Receipt className='h-4 w-4 text-purple-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-purple-600'>
            {stats.transactionCount}
          </div>
          <p className='text-xs text-muted-foreground'>
            Total transactions recorded
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function CategoryBreakdown({ stats }: TransactionStatsProps) {
  const { settings } = useUserSettings();

  if (stats.categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>No expense data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <p className='text-sm text-muted-foreground'>
          Your spending by category
        </p>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {stats.categoryBreakdown.slice(0, 5).map((category, index) => (
            <div key={category.category} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>{category.category}</span>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-muted-foreground'>
                    {formatCurrency(category.amount, settings.currency)}
                  </span>
                  <Badge variant='secondary' className='text-xs'>
                    {category.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-primary h-2 rounded-full transition-all duration-300'
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
