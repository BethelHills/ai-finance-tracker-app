'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Activity,
  RefreshCw,
  Eye,
  EyeOff,
  Target,
} from 'lucide-react';
import { useSimulation } from '@/lib/simulation/simulation-context';

export function SimulationDashboard() {
  const {
    user,
    accounts,
    transactions,
    stats,
    isSimulationMode,
    toggleSimulationMode,
    refreshData,
  } = useSimulation();

  if (!isSimulationMode || !user || !stats) {
    return null;
  }

  const recentTransactions = transactions.slice(0, 5);
  const topCategories = getTopCategories(transactions);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Welcome back, {user.name}!</h2>
          <p className='text-muted-foreground'>
            Here's your financial overview for {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button onClick={refreshData} variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh Data
          </Button>
          <Button onClick={toggleSimulationMode} variant='outline' size='sm'>
            <EyeOff className='h-4 w-4 mr-2' />
            Exit Simulation
          </Button>
        </div>
      </div>

      {/* Main Financial Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Balance Card */}
        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Balance</CardTitle>
            <DollarSign className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              ${stats.netWorth.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              Across {stats.accountCount} accounts
            </p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Income
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              ${stats.totalIncome.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className='border-l-4 border-l-red-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Expenses
            </CardTitle>
            <TrendingDown className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              ${stats.totalExpenses.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        {/* Savings Card */}
        <Card className='border-l-4 border-l-emerald-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Savings
            </CardTitle>
            <Target className='h-4 w-4 text-emerald-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-600'>
              ${stats.netAmount.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {((stats.netAmount / stats.totalIncome) * 100).toFixed(1)}%
              savings rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <CreditCard className='h-5 w-5' />
            <span>Your Accounts</span>
          </CardTitle>
          <CardDescription>
            Overview of all your connected accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {accounts.map(account => (
              <div key={account.id} className='p-4 border rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-medium'>{account.name}</h4>
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className='text-2xl font-bold'>
                  {account.currency} {account.balance.toLocaleString()}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)}{' '}
                  • {account.provider}
                </div>
                <div className='text-xs text-muted-foreground mt-1'>
                  Updated: {account.lastUpdated.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Activity className='h-5 w-5' />
            <span>Recent Transactions</span>
          </CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentTransactions.map(transaction => (
              <div
                key={transaction.id}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div className='flex items-center space-x-3'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-green-500'
                        : transaction.type === 'expense'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <h4 className='font-medium'>{transaction.description}</h4>
                    <p className='text-sm text-muted-foreground'>
                      {transaction.category} •{' '}
                      {transaction.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <div
                    className={`text-right ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <div className='font-medium'>
                      {transaction.amount > 0 ? '+' : ''}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'default'
                          : transaction.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Your spending breakdown this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {topCategories.map((category, index) => (
              <div
                key={category.name}
                className='flex items-center justify-between'
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium'>
                    {index + 1}
                  </div>
                  <span className='font-medium'>{category.name}</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='w-32 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full'
                      style={{
                        width: `${(Number(category.amount) / Number(topCategories[0].amount)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className='font-medium'>
                    ${Number(category.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Notice */}
      <Card className='border-yellow-200 bg-yellow-50'>
        <CardContent className='pt-6'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-yellow-500 rounded-full animate-pulse'></div>
            <span className='font-medium text-yellow-800'>
              Simulation Mode Active
            </span>
          </div>
          <p className='text-sm text-yellow-700 mt-1'>
            You're viewing simulated financial data. All transactions, accounts,
            and balances are generated for demonstration purposes only. No real
            money is involved in this simulation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getTopCategories(transactions: any[]) {
  const categorySpending = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      },
      {} as Record<string, number>
    );

  return Object.entries(categorySpending)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);
}
