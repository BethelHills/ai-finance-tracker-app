'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
  RefreshCw,
} from 'lucide-react';

interface SmartAlert {
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  amount?: number;
  percentage?: number;
}

interface SmartAlertsProps {
  currentSpending: Record<string, number>;
  budgets: Record<string, number>;
  previousMonthSpending: Record<string, number>;
  income: number;
}

export function SmartAlerts({
  currentSpending,
  budgets,
  previousMonthSpending,
  income,
}: SmartAlertsProps) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(
    new Set()
  );

  const generateAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/smart-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSpending,
          budgets,
          previousMonthSpending,
          income,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      } else {
        console.error('Failed to generate smart alerts');
        // Fallback to mock alerts for demo
        setAlerts(getMockAlerts());
      }
    } catch (error) {
      console.error('Error generating smart alerts:', error);
      // Fallback to mock alerts for demo
      setAlerts(getMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  const getMockAlerts = (): SmartAlert[] => {
    return [
      {
        type: 'warning',
        title: 'Food Budget Alert',
        message: "You're at 85% of your Food budget ($510/$600)",
        priority: 'medium',
        category: 'Food',
        amount: 510,
        percentage: 85,
      },
      {
        type: 'success',
        title: 'Savings Achievement',
        message: 'You saved $150 more than last month! 🎉',
        priority: 'low',
        amount: 150,
      },
      {
        type: 'info',
        title: 'Spending Trend',
        message: 'Your Transportation spending increased 12% this month',
        priority: 'low',
        category: 'Transportation',
        percentage: 12,
      },
    ];
  };

  useEffect(() => {
    generateAlerts();
  }, [currentSpending, budgets, previousMonthSpending, income]);

  const dismissAlert = (index: number) => {
    setDismissedAlerts(prev => new Set(prev).add(index));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className='h-5 w-5 text-yellow-500' />;
      case 'success':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'info':
        return <Info className='h-5 w-5 text-blue-500' />;
      default:
        return <Info className='h-5 w-5 text-gray-500' />;
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (type === 'warning') {
      return priority === 'high'
        ? 'border-red-200 bg-red-50'
        : 'border-yellow-200 bg-yellow-50';
    }
    if (type === 'success') {
      return 'border-green-200 bg-green-50';
    }
    return 'border-blue-200 bg-blue-50';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.low}>
        {priority}
      </Badge>
    );
  };

  const visibleAlerts = alerts.filter(
    (_, index) => !dismissedAlerts.has(index)
  );

  if (visibleAlerts.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Smart Alerts</span>
            <Button
              variant='outline'
              size='sm'
              onClick={generateAlerts}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <CheckCircle className='h-12 w-12 mx-auto mb-4 text-green-500' />
            <p className='text-lg font-medium'>
              All good! No alerts at this time.
            </p>
            <p className='text-sm'>Your finances are on track.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Smart Alerts</span>
          <Button
            variant='outline'
            size='sm'
            onClick={generateAlerts}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <div key={i} className='animate-pulse'>
                <div className='h-20 bg-gray-200 rounded-lg'></div>
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-4'>
            {visibleAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getAlertColor(alert.type, alert.priority)}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-start space-x-3 flex-1'>
                    {getAlertIcon(alert.type)}
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-1'>
                        <h4 className='font-semibold text-sm'>{alert.title}</h4>
                        {getPriorityBadge(alert.priority)}
                      </div>
                      <p className='text-sm text-muted-foreground mb-2'>
                        {alert.message}
                      </p>
                      {alert.percentage && (
                        <div className='flex items-center space-x-2'>
                          {alert.percentage > 0 ? (
                            <TrendingUp className='h-4 w-4 text-red-500' />
                          ) : (
                            <TrendingDown className='h-4 w-4 text-green-500' />
                          )}
                          <span className='text-xs text-muted-foreground'>
                            {alert.percentage > 0 ? '+' : ''}
                            {alert.percentage}%
                          </span>
                        </div>
                      )}
                      {alert.amount && (
                        <div className='flex items-center space-x-2 mt-1'>
                          <DollarSign className='h-4 w-4 text-green-600' />
                          <span className='text-xs font-medium text-green-600'>
                            ${alert.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => dismissAlert(index)}
                    className='h-8 w-8 p-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
