'use client';

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
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Brain,
  CheckCircle,
} from 'lucide-react';

const transactions = [
  {
    id: 1,
    description: 'Grocery Store',
    amount: -85.5,
    category: 'Food',
    date: '2024-01-15',
    aiCategorized: true,
    aiConfidence: 0.95,
  },
  {
    id: 2,
    description: 'Salary Deposit',
    amount: 4250.0,
    category: 'Income',
    date: '2024-01-14',
    aiCategorized: false,
    aiConfidence: null,
  },
  {
    id: 3,
    description: 'Gas Station',
    amount: -45.2,
    category: 'Transportation',
    date: '2024-01-14',
    aiCategorized: true,
    aiConfidence: 0.88,
  },
  {
    id: 4,
    description: 'Netflix Subscription',
    amount: -15.99,
    category: 'Entertainment',
    date: '2024-01-13',
    aiCategorized: true,
    aiConfidence: 0.92,
  },
  {
    id: 5,
    description: 'Coffee Shop',
    amount: -4.5,
    category: 'Food',
    date: '2024-01-13',
    aiCategorized: true,
    aiConfidence: 0.78,
  },
];

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <CreditCard className='h-5 w-5' />
          <span>Recent Transactions</span>
        </CardTitle>
        <CardDescription>
          Latest financial activity with AI categorization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {transactions.map(transaction => (
            <div
              key={transaction.id}
              className='flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <div
                  className={`p-2 rounded-full ${
                    transaction.amount > 0
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {transaction.amount > 0 ? (
                    <ArrowUpRight className='h-4 w-4' />
                  ) : (
                    <ArrowDownRight className='h-4 w-4' />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2'>
                    <p className='text-sm font-medium truncate'>
                      {transaction.description}
                    </p>
                    {transaction.aiCategorized && (
                      <div className='flex items-center space-x-1'>
                        <Brain className='h-3 w-3 text-purple-500' />
                        <span className='text-xs text-purple-600 font-medium'>
                          {Math.round((transaction.aiConfidence || 0) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='flex items-center space-x-2 mt-1'>
                    <Badge variant='outline' className='text-xs'>
                      {transaction.category}
                    </Badge>
                    <span className='text-xs text-muted-foreground'>
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <p
                  className={`text-sm font-medium ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </p>
                {transaction.aiCategorized && (
                  <div className='flex items-center space-x-1 mt-1'>
                    <CheckCircle className='h-3 w-3 text-green-500' />
                    <span className='text-xs text-green-600'>AI</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 pt-4 border-t'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Brain className='h-4 w-4 text-purple-500' />
              <span className='text-sm text-muted-foreground'>
                AI categorized 4 of 5 transactions
              </span>
            </div>
            <Button variant='ghost' size='sm'>
              View All
              <MoreHorizontal className='h-4 w-4 ml-1' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
