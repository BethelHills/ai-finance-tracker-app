'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Brain,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BudgetOptimizationCardProps {
  currentBudget: Record<string, number>;
  optimizedBudget: Record<string, number>;
  savingsPotential: number;
  reasoning: string;
  onApplyOptimization?: (optimizedBudget: Record<string, number>) => void;
  onDismiss?: () => void;
  className?: string;
}

export function BudgetOptimizationCard({
  currentBudget,
  optimizedBudget,
  savingsPotential,
  reasoning,
  onApplyOptimization,
  onDismiss,
  className,
}: BudgetOptimizationCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApplyOptimization = async () => {
    setIsApplying(true);
    try {
      await onApplyOptimization?.(optimizedBudget);
    } finally {
      setIsApplying(false);
    }
  };

  const getSavingsPercentage = (category: string) => {
    const current = currentBudget[category] || 0;
    const optimized = optimizedBudget[category] || 0;
    if (current === 0) return 0;
    return ((current - optimized) / current) * 100;
  };

  const getSavingsColor = (percentage: number) => {
    if (percentage > 20) return 'text-green-600';
    if (percentage > 10) return 'text-yellow-600';
    if (percentage > 0) return 'text-blue-600';
    return 'text-gray-500';
  };

  const getSavingsIcon = (percentage: number) => {
    if (percentage > 20) return TrendingUp;
    if (percentage > 10) return TrendingUp;
    if (percentage > 0) return TrendingUp;
    return Target;
  };

  return (
    <Card
      className={cn(
        'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50',
        className
      )}
    >
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='p-2 rounded-full bg-purple-100'>
              <Brain className='h-5 w-5 text-purple-600' />
            </div>
            <div>
              <CardTitle className='text-lg font-semibold text-purple-900'>
                AI Budget Optimization
              </CardTitle>
              <p className='text-sm text-purple-700'>
                Save ${savingsPotential.toFixed(2)} per month with these
                recommendations
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge
              variant='secondary'
              className='bg-purple-100 text-purple-800'
            >
              <Sparkles className='h-3 w-3 mr-1' />
              AI Powered
            </Badge>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='text-purple-600 hover:text-purple-800'
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Savings Summary */}
        <div className='p-4 bg-white rounded-lg border'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='font-medium text-gray-900'>
              Monthly Savings Potential
            </h4>
            <div className='flex items-center space-x-2'>
              <DollarSign className='h-4 w-4 text-green-600' />
              <span className='text-2xl font-bold text-green-600'>
                ${savingsPotential.toFixed(2)}
              </span>
            </div>
          </div>
          <Progress
            value={
              (savingsPotential /
                (Object.values(currentBudget).reduce((a, b) => a + b, 0) *
                  0.1)) *
              100
            }
            className='h-2'
          />
          <p className='text-xs text-gray-600 mt-1'>
            {(
              (savingsPotential /
                Object.values(currentBudget).reduce((a, b) => a + b, 0)) *
              100
            ).toFixed(1)}
            % of total budget
          </p>
        </div>

        {/* Category Breakdown */}
        <div className='space-y-3'>
          <h4 className='font-medium text-gray-900'>Category Optimizations</h4>
          {Object.keys(optimizedBudget).map(category => {
            const current = currentBudget[category] || 0;
            const optimized = optimizedBudget[category] || 0;
            const savings = current - optimized;
            const savingsPercentage = getSavingsPercentage(category);
            const SavingsIcon = getSavingsIcon(savingsPercentage);
            const savingsColor = getSavingsColor(savingsPercentage);

            return (
              <div
                key={category}
                className='flex items-center justify-between p-3 bg-white rounded-lg border'
              >
                <div className='flex-1'>
                  <div className='flex items-center space-x-2'>
                    <span className='font-medium text-gray-900 capitalize'>
                      {category}
                    </span>
                    {savings > 0 && (
                      <Badge
                        variant='outline'
                        className={cn('text-xs', savingsColor)}
                      >
                        <SavingsIcon className='h-3 w-3 mr-1' />-
                        {savingsPercentage.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center space-x-4 mt-1'>
                    <span className='text-sm text-gray-600'>
                      ${current.toFixed(2)} → ${optimized.toFixed(2)}
                    </span>
                    {savings > 0 && (
                      <span className={cn('text-sm font-medium', savingsColor)}>
                        Save ${savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Reasoning */}
        {isExpanded && (
          <div className='p-4 bg-purple-50 rounded-lg border border-purple-200'>
            <div className='flex items-start space-x-2'>
              <Brain className='h-4 w-4 text-purple-600 mt-0.5' />
              <div>
                <h5 className='text-sm font-medium text-purple-900 mb-1'>
                  AI Analysis
                </h5>
                <p className='text-sm text-purple-800'>{reasoning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex items-center justify-between pt-4 border-t'>
          <div className='flex items-center space-x-2'>
            <CheckCircle className='h-4 w-4 text-green-600' />
            <span className='text-sm text-gray-600'>
              Based on your spending patterns
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            {onDismiss && (
              <Button
                variant='outline'
                size='sm'
                onClick={onDismiss}
                disabled={isApplying}
              >
                Dismiss
              </Button>
            )}
            <Button
              onClick={handleApplyOptimization}
              disabled={isApplying}
              className='bg-purple-600 hover:bg-purple-700 text-white'
            >
              {isApplying ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Applying...
                </>
              ) : (
                <>
                  Apply Optimization
                  <ArrowRight className='h-4 w-4 ml-2' />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BudgetOptimizationCard;
