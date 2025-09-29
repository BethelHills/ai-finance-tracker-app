'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { AIInsights } from '@/components/ai-insights';
import { SpendingChart } from '@/components/spending-chart';
import { RecentTransactions } from '@/components/recent-transactions';
import { BudgetOverview } from '@/components/budget-overview';

// Mock data - in real app, this would come from API
const mockData = {
  totalBalance: 15420.5,
  monthlyIncome: 8500.0,
  monthlyExpenses: 6234.5,
  monthlySavings: 2265.5,
  budgetUtilization: 73,
  aiInsights: [
    {
      id: 1,
      type: 'spending_analysis',
      title: 'Unusual Spending Detected',
      description:
        'Your dining expenses increased by 45% this month compared to last month.',
      priority: 'high' as const,
      recommendation:
        'Consider setting a dining budget of $400/month to maintain your savings goals.',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    {
      id: 2,
      type: 'budget_optimization',
      title: 'Budget Optimization Opportunity',
      description:
        'You can save $200/month by switching to a different grocery store.',
      priority: 'medium' as const,
      recommendation:
        'Based on your shopping patterns, StoreX offers 15% better prices.',
      icon: Target,
      color: 'text-blue-500',
    },
    {
      id: 3,
      type: 'goal_progress',
      title: 'Emergency Fund Goal',
      description: "You're 78% towards your $10,000 emergency fund goal.",
      priority: 'low' as const,
      recommendation:
        "Keep up the great work! You'll reach your goal in 2.3 months.",
      icon: CheckCircle,
      color: 'text-green-500',
    },
  ],
};

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome back! Here's your financial overview with AI insights.
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='secondary' className='ai-gradient text-white'>
            <Brain className='h-3 w-3 mr-1' />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Balance</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${mockData.totalBalance.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Income
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${mockData.monthlyIncome.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Expenses
            </CardTitle>
            <TrendingDown className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${mockData.monthlyExpenses.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              +1.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Savings
            </CardTitle>
            <Target className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${mockData.monthlySavings.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {(
                (mockData.monthlySavings / mockData.monthlyIncome) *
                100
              ).toFixed(1)}
              % of income
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className='grid gap-6 sm:grid-cols-1 lg:grid-cols-3'>
        {/* AI Insights */}
        <div className='lg:col-span-2'>
          <AIInsights insights={mockData.aiInsights} />
        </div>

        {/* Budget Overview */}
        <div>
          <BudgetOverview utilization={mockData.budgetUtilization} />
        </div>

        {/* Spending Chart */}
        <div className='lg:col-span-2'>
          <SpendingChart />
        </div>

        {/* Recent Transactions */}
        <div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
