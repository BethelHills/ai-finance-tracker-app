'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface BudgetOverviewProps {
  utilization: number;
}

export function BudgetOverview({ utilization }: BudgetOverviewProps) {
  const budgetStatus =
    utilization > 90 ? 'over' : utilization > 75 ? 'warning' : 'good';

  const statusConfig = {
    over: {
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      icon: AlertTriangle,
      message: 'Over Budget',
      badge: 'destructive',
    },
    warning: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      icon: AlertTriangle,
      message: 'Near Limit',
      badge: 'secondary',
    },
    good: {
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      icon: CheckCircle,
      message: 'On Track',
      badge: 'default',
    },
  };

  const config = statusConfig[budgetStatus];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Target className='h-5 w-5' />
          <span>Budget Overview</span>
        </CardTitle>
        <CardDescription>Current month budget utilization</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>Monthly Budget</span>
            <span className='font-medium'>$5,000</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span>Spent</span>
            <span className='font-medium'>
              ${((5000 * utilization) / 100).toFixed(0)}
            </span>
          </div>
          <Progress value={utilization} className='h-2' />
          <div className='flex justify-between text-sm'>
            <span>Remaining</span>
            <span className='font-medium'>
              ${((5000 * (100 - utilization)) / 100).toFixed(0)}
            </span>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${config.bgColor}`}>
          <div className='flex items-center space-x-2'>
            <config.icon className={`h-4 w-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>
              {config.message}
            </span>
            <Badge variant={config.badge as any} className='ml-auto'>
              {utilization}%
            </Badge>
          </div>
        </div>

        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Top Categories</h4>
          <div className='space-y-2'>
            {[
              { name: 'Housing', spent: 1750, budget: 2000, percentage: 87.5 },
              { name: 'Food', spent: 800, budget: 1000, percentage: 80 },
              {
                name: 'Transportation',
                spent: 450,
                budget: 600,
                percentage: 75,
              },
              {
                name: 'Entertainment',
                spent: 300,
                budget: 400,
                percentage: 75,
              },
            ].map(category => (
              <div
                key={category.name}
                className='flex items-center justify-between'
              >
                <div className='flex-1'>
                  <div className='flex justify-between text-xs'>
                    <span>{category.name}</span>
                    <span>
                      ${category.spent}/${category.budget}
                    </span>
                  </div>
                  <Progress value={category.percentage} className='h-1 mt-1' />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button className='w-full' variant='outline'>
          <TrendingUp className='h-4 w-4 mr-2' />
          View All Budgets
        </Button>
      </CardContent>
    </Card>
  );
}
