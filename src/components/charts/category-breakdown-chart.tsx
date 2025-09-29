'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CategoryBreakdownChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  totalAmount: number;
  period?: 'current' | 'lastMonth' | 'last3Months' | 'lastYear';
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#84cc16', // lime
  '#f59e0b', // amber
  '#10b981', // emerald
  '#6366f1', // indigo
];

export function CategoryBreakdownChart({
  data,
  totalAmount,
  period = 'current',
}: CategoryBreakdownChartProps) {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const getPeriodLabel = () => {
    switch (period) {
      case 'current':
        return 'Current Month';
      case 'lastMonth':
        return 'Last Month';
      case 'last3Months':
        return 'Last 3 Months';
      case 'lastYear':
        return 'Last Year';
      default:
        return 'Current Month';
    }
  };

  const renderCustomizedLabel = (entry: any) => {
    if (entry.percentage < 5) return ''; // Don't show labels for small slices
    return `${entry.percentage.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-card border border-border rounded-lg p-3 shadow-lg'>
          <p className='font-medium'>{data.category}</p>
          <p className='text-sm text-muted-foreground'>
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Category Breakdown</span>
          <Badge variant='outline'>{getPeriodLabel()}</Badge>
        </CardTitle>
        <CardDescription>
          See how your expenses are distributed across different categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Pie Chart */}
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={data}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill='#8884d8'
                  dataKey='amount'
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and Details */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <h4 className='font-medium'>Total Expenses</h4>
              <p className='text-2xl font-bold text-primary'>
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <div className='space-y-3'>
              <h4 className='font-medium'>Categories</h4>
              <div className='space-y-2 max-h-48 overflow-y-auto'>
                {data
                  .sort((a, b) => b.amount - a.amount)
                  .map((item, index) => (
                    <div
                      key={item.category}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center space-x-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor:
                              item.color || COLORS[index % COLORS.length],
                          }}
                        />
                        <span className='text-sm font-medium'>
                          {item.category}
                        </span>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>
                          {formatCurrency(item.amount)}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
