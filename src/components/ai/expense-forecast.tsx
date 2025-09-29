'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Calendar,
  RefreshCw,
  BarChart3,
  Target,
} from 'lucide-react';

interface ForecastData {
  nextMonthForecast: Record<string, number>;
  totalForecast: number;
  confidence: number;
  trends: Array<{
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    percentageChange: number;
  }>;
}

interface ExpenseForecastProps {
  historicalData: Array<{
    month: string;
    spending: Record<string, number>;
    total: number;
  }>;
  currentMonth: string;
}

export function ExpenseForecast({
  historicalData,
  currentMonth,
}: ExpenseForecastProps) {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          historicalData,
          currentMonth,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setForecast(data);
      } else {
        console.error('Failed to generate forecast');
        // Fallback to mock data for demo
        setForecast(getMockForecast());
      }
    } catch (error) {
      console.error('Error generating forecast:', error);
      // Fallback to mock data for demo
      setForecast(getMockForecast());
    } finally {
      setLoading(false);
    }
  };

  const getMockForecast = (): ForecastData => {
    return {
      nextMonthForecast: {
        'Food & Dining': 650,
        Transportation: 450,
        Entertainment: 200,
        Utilities: 180,
        Shopping: 320,
        Healthcare: 150,
      },
      totalForecast: 1950,
      confidence: 0.78,
      trends: [
        {
          category: 'Food & Dining',
          trend: 'increasing',
          percentageChange: 8.5,
        },
        {
          category: 'Transportation',
          trend: 'stable',
          percentageChange: 2.1,
        },
        {
          category: 'Entertainment',
          trend: 'decreasing',
          percentageChange: -5.2,
        },
      ],
    };
  };

  useEffect(() => {
    generateForecast();
  }, [historicalData, currentMonth]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className='h-4 w-4 text-red-500' />;
      case 'decreasing':
        return <TrendingDown className='h-4 w-4 text-green-500' />;
      case 'stable':
        return <Minus className='h-4 w-4 text-blue-500' />;
      default:
        return <Minus className='h-4 w-4 text-gray-500' />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600';
      case 'decreasing':
        return 'text-green-600';
      case 'stable':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!forecast && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <Calendar className='h-12 w-12 mx-auto mb-4' />
            <p>No historical data available for forecasting.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Expense Forecast</span>
          <Button
            variant='outline'
            size='sm'
            onClick={generateForecast}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Update
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='space-y-4'>
            <div className='animate-pulse'>
              <div className='h-8 bg-gray-200 rounded mb-4'></div>
              <div className='h-4 bg-gray-200 rounded mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            </div>
          </div>
        ) : forecast ? (
          <div className='space-y-6'>
            {/* Total Forecast */}
            <div className='text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg'>
              <div className='flex items-center justify-center space-x-2 mb-2'>
                <DollarSign className='h-6 w-6 text-blue-600' />
                <span className='text-2xl font-bold text-blue-600'>
                  ${forecast.totalForecast.toLocaleString()}
                </span>
              </div>
              <p className='text-sm text-muted-foreground'>
                Predicted for next month
              </p>
              <div className='flex items-center justify-center space-x-2 mt-2'>
                <Badge variant='outline' className='text-xs'>
                  {Math.round(forecast.confidence * 100)}% confidence
                </Badge>
              </div>
            </div>

            {/* Category Forecasts */}
            <div className='space-y-4'>
              <h4 className='font-semibold text-sm text-muted-foreground'>
                Category Breakdown
              </h4>
              {Object.entries(forecast.nextMonthForecast)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = (amount / forecast.totalForecast) * 100;
                  const trend = forecast.trends.find(
                    t => t.category === category
                  );

                  return (
                    <div key={category} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm font-medium'>
                            {category}
                          </span>
                          {trend && (
                            <div className='flex items-center space-x-1'>
                              {getTrendIcon(trend.trend)}
                              <span
                                className={`text-xs ${getTrendColor(trend.trend)}`}
                              >
                                {trend.percentageChange > 0 ? '+' : ''}
                                {trend.percentageChange.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <span className='text-sm font-semibold'>
                          ${amount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={percentage} className='h-2' />
                    </div>
                  );
                })}
            </div>

            {/* Trends Summary */}
            {forecast.trends.length > 0 && (
              <div className='space-y-3'>
                <h4 className='font-semibold text-sm text-muted-foreground'>
                  Key Trends
                </h4>
                <div className='space-y-2'>
                  {forecast.trends.map((trend, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center space-x-3'>
                        {getTrendIcon(trend.trend)}
                        <span className='text-sm font-medium'>
                          {trend.category}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`text-sm font-semibold ${getTrendColor(trend.trend)}`}
                        >
                          {trend.trend === 'increasing'
                            ? '↑'
                            : trend.trend === 'decreasing'
                              ? '↓'
                              : '→'}
                        </span>
                        <span
                          className={`text-xs ${getTrendColor(trend.trend)}`}
                        >
                          {trend.percentageChange > 0 ? '+' : ''}
                          {trend.percentageChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Indicator */}
            <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center space-x-2'>
                <Target className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-medium'>Forecast Confidence</span>
              </div>
              <div className='flex items-center space-x-2'>
                <Progress
                  value={forecast.confidence * 100}
                  className='w-20 h-2'
                />
                <span className='text-xs font-semibold text-blue-600'>
                  {Math.round(forecast.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
