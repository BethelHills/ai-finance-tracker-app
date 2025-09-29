'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface ExpenseTrendsChartProps {
  data: Array<{
    month: string;
    expenses: number;
    income: number;
    savings: number;
  }>;
  period?: '6months' | '12months' | '2years';
}

export function ExpenseTrendsChart({
  data,
  period = '6months',
}: ExpenseTrendsChartProps) {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const getPeriodLabel = () => {
    switch (period) {
      case '6months':
        return 'Last 6 Months';
      case '12months':
        return 'Last 12 Months';
      case '2years':
        return 'Last 2 Years';
      default:
        return 'Last 6 Months';
    }
  };

  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const percentage =
      ((latest.expenses - previous.expenses) / previous.expenses) * 100;

    return {
      direction: percentage > 0 ? 'up' : 'down',
      percentage: Math.abs(percentage),
    };
  };

  const trend = calculateTrend();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Expense Trends</span>
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-muted-foreground'>
              {getPeriodLabel()}
            </span>
            {trend.percentage > 0 && (
              <div
                className={`flex items-center space-x-1 text-sm ${
                  trend.direction === 'up' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className='h-4 w-4' />
                ) : (
                  <TrendingDown className='h-4 w-4' />
                )}
                <span>{trend.percentage.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Track your spending patterns and identify trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis
                dataKey='month'
                className='text-muted-foreground text-xs'
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className='text-muted-foreground text-xs'
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line
                type='monotone'
                dataKey='expenses'
                stroke='#ef4444'
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name='Expenses'
              />
              <Line
                type='monotone'
                dataKey='income'
                stroke='#22c55e'
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name='Income'
              />
              <Line
                type='monotone'
                dataKey='savings'
                stroke='#3b82f6'
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name='Savings'
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
