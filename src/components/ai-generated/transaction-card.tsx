'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Brain,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TransactionCardProps {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  aiCategorized?: boolean;
  aiConfidence?: number;
  aiTags?: string[];
  className?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRecategorize?: (id: string) => void;
}

export function TransactionCard({
  id,
  description,
  amount,
  category,
  date,
  aiCategorized = false,
  aiConfidence = 0,
  aiTags = [],
  className,
  onEdit,
  onDelete,
  onRecategorize,
}: TransactionCardProps) {
  const isIncome = amount > 0;
  const confidenceColor =
    aiConfidence > 0.8
      ? 'text-green-600'
      : aiConfidence > 0.6
        ? 'text-yellow-600'
        : 'text-red-600';

  const confidenceIcon =
    aiConfidence > 0.8
      ? CheckCircle
      : aiConfidence > 0.6
        ? AlertTriangle
        : AlertTriangle;

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        aiCategorized && 'border-l-4 border-l-purple-500',
        className
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div
              className={cn(
                'p-2 rounded-full',
                isIncome
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              )}
            >
              {isIncome ? (
                <ArrowUpRight className='h-4 w-4' />
              ) : (
                <ArrowDownRight className='h-4 w-4' />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <CardTitle className='text-sm font-medium truncate'>
                {description}
              </CardTitle>
              <div className='flex items-center space-x-2 mt-1'>
                <Badge variant='outline' className='text-xs'>
                  {category}
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  {new Date(date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className='text-right'>
            <p
              className={cn(
                'text-sm font-medium',
                isIncome ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isIncome ? '+' : ''}${Math.abs(amount).toFixed(2)}
            </p>
            {aiCategorized && (
              <div className='flex items-center space-x-1 mt-1'>
                <Brain className='h-3 w-3 text-purple-500' />
                <span className='text-xs text-purple-600'>AI</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {aiCategorized && (
        <CardContent className='pt-0'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div className={cn('h-3 w-3 rounded-full', confidenceColor)} />
              <span className={cn('text-xs font-medium', confidenceColor)}>
                {Math.round(aiConfidence * 100)}% confidence
              </span>
            </div>
            {aiTags.length > 0 && (
              <div className='flex space-x-1'>
                {aiTags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant='secondary' className='text-xs'>
                    {tag}
                  </Badge>
                ))}
                {aiTags.length > 2 && (
                  <Badge variant='secondary' className='text-xs'>
                    +{aiTags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}

      <CardContent className='pt-0'>
        <div className='flex items-center justify-between'>
          <div className='flex space-x-1'>
            {onEdit && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onEdit(id)}
                className='h-8 px-2'
              >
                Edit
              </Button>
            )}
            {onRecategorize && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onRecategorize(id)}
                className='h-8 px-2'
              >
                Recategorize
              </Button>
            )}
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete?.(id)}
            className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
          >
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TransactionCard;
