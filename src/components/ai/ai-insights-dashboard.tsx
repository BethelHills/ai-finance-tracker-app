'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SmartAlerts } from './smart-alerts';
import { ExpenseForecast } from './expense-forecast';
import { SmartCategorization } from './smart-categorization';

interface SpendingAnalysis {
  totalSpent: number;
  totalIncome: number;
  netAmount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  spendingTrends: Array<{
    period: string;
    amount: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  unusualSpending: Array<{
    description: string;
    amount: number;
    reason: string;
  }>;
  budgetAlerts: Array<{
    category: string;
    spent: number;
    budget: number;
    percentage: number;
  }>;
}

interface FinancialRecommendation {
  id: string;
  type: 'savings' | 'spending' | 'investment' | 'debt' | 'budget';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  potentialSavings?: number;
  confidence: number;
  category?: string;
}

interface TransactionInsight {
  id: string;
  transactionId: string;
  category: string;
  subcategory?: string;
  confidence: number;
  tags: string[];
  insights: string[];
  recommendations: string[];
  spendingPattern: 'normal' | 'unusual' | 'concerning';
  merchantInfo?: {
    name: string;
    category: string;
    location?: string;
  };
  createdAt: Date;
}

export function AIInsightsDashboard() {
  const [spendingAnalysis, setSpendingAnalysis] =
    useState<SpendingAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<
    FinancialRecommendation[]
  >([]);
  const [insights, setInsights] = useState<TransactionInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const { toast } = useToast();

  useEffect(() => {
    loadInsights();
  }, [selectedTimeframe]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/plaid/transactions?timeframe=${selectedTimeframe}`
      );
      if (response.ok) {
        const data = await response.json();
        setSpendingAnalysis(data.spendingAnalysis);
        setRecommendations(data.recommendations);
        setInsights(data.insights);
      }
    } catch (error) {
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const exportInsights = async () => {
    try {
      const response = await fetch('/api/ai-insights/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spendingAnalysis,
          recommendations,
          insights,
          timeframe: selectedTimeframe,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-insights-${selectedTimeframe}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('AI insights exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export insights');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <Target className='h-4 w-4' />;
      case 'spending':
        return <TrendingDown className='h-4 w-4' />;
      case 'investment':
        return <TrendingUp className='h-4 w-4' />;
      case 'debt':
        return <AlertTriangle className='h-4 w-4' />;
      case 'budget':
        return <BarChart3 className='h-4 w-4' />;
      default:
        return <Lightbulb className='h-4 w-4' />;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading AI insights...</span>
      </div>
    );
  }

  if (!spendingAnalysis) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500'>No insights available</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>AI Financial Insights</h2>
          <p className='text-muted-foreground'>
            Intelligent analysis of your spending patterns and financial health
          </p>
        </div>
        <div className='flex space-x-2'>
          <select
            value={selectedTimeframe}
            onChange={e => setSelectedTimeframe(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='7d'>Last 7 days</option>
            <option value='30d'>Last 30 days</option>
            <option value='90d'>Last 90 days</option>
            <option value='1y'>Last year</option>
          </select>
          <Button onClick={exportInsights} variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button onClick={loadInsights}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              ${spendingAnalysis.totalIncome.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              <TrendingUp className='h-3 w-3 inline mr-1' />
              +5.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              ${spendingAnalysis.totalSpent.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              <TrendingDown className='h-3 w-3 inline mr-1' />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Net Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                spendingAnalysis.netAmount >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              ${spendingAnalysis.netAmount.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {spendingAnalysis.netAmount >= 0
                ? 'Positive cash flow'
                : 'Negative cash flow'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {(
                (spendingAnalysis.netAmount / spendingAnalysis.totalIncome) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className='text-xs text-muted-foreground'>
              Of total income saved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Categories */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <PieChart className='h-5 w-5' />
            <span>Top Spending Categories</span>
          </CardTitle>
          <CardDescription>
            Your biggest expense categories this period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {spendingAnalysis.topCategories.map((category, index) => (
              <div key={category.category} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{category.category}</span>
                  <div className='text-right'>
                    <div className='font-bold'>
                      ${category.amount.toLocaleString()}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {category.percentage.toFixed(1)}% •{' '}
                      {category.transactionCount} transactions
                    </div>
                  </div>
                </div>
                <Progress value={category.percentage} className='h-2' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Lightbulb className='h-5 w-5' />
            <span>AI Recommendations</span>
          </CardTitle>
          <CardDescription>
            Personalized suggestions to improve your financial health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className='p-4 border rounded-lg hover:bg-gray-50 transition-colors'
              >
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0'>{getTypeIcon(rec.type)}</div>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <h4 className='font-medium'>{rec.title}</h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>
                      {rec.description}
                    </p>
                    <p className='text-sm font-medium text-blue-600 mb-2'>
                      {rec.action}
                    </p>
                    {rec.potentialSavings && (
                      <p className='text-sm text-green-600'>
                        Potential savings: $
                        {rec.potentialSavings.toLocaleString()}
                      </p>
                    )}
                    <div className='flex items-center space-x-2 mt-2'>
                      <div className='text-xs text-gray-500'>
                        Confidence: {Math.round(rec.confidence * 100)}%
                      </div>
                      {rec.category && (
                        <Badge variant='outline' className='text-xs'>
                          {rec.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unusual Spending Alerts */}
      {spendingAnalysis.unusualSpending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <AlertTriangle className='h-5 w-5 text-orange-600' />
              <span>Unusual Spending Detected</span>
            </CardTitle>
            <CardDescription>
              AI has identified potentially unusual spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {spendingAnalysis.unusualSpending.map((spending, index) => (
                <div
                  key={index}
                  className='p-3 bg-orange-50 border border-orange-200 rounded-lg'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-orange-900'>
                        {spending.description}
                      </h4>
                      <p className='text-sm text-orange-700'>
                        {spending.reason}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='font-bold text-orange-900'>
                        ${spending.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Alerts */}
      {spendingAnalysis.budgetAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <AlertTriangle className='h-5 w-5 text-red-600' />
              <span>Budget Alerts</span>
            </CardTitle>
            <CardDescription>
              Categories where you've exceeded your budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {spendingAnalysis.budgetAlerts.map((alert, index) => (
                <div
                  key={index}
                  className='p-3 bg-red-50 border border-red-200 rounded-lg'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-red-900'>
                        {alert.category}
                      </h4>
                      <p className='text-sm text-red-700'>
                        Spent ${alert.spent.toLocaleString()} of $
                        {alert.budget.toLocaleString()} budget
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='font-bold text-red-900'>
                        {alert.percentage.toFixed(0)}%
                      </div>
                      <div className='text-sm text-red-700'>over budget</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Insights */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <BarChart3 className='h-5 w-5' />
            <span>Transaction Insights</span>
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your recent transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {insights.slice(0, 5).map(insight => (
              <div key={insight.id} className='p-4 border rounded-lg'>
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex items-center space-x-2'>
                    <Badge variant='outline'>{insight.category}</Badge>
                    {insight.subcategory && (
                      <Badge variant='secondary'>{insight.subcategory}</Badge>
                    )}
                    <Badge
                      className={
                        insight.spendingPattern === 'concerning'
                          ? 'bg-red-100 text-red-800'
                          : insight.spendingPattern === 'unusual'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }
                    >
                      {insight.spendingPattern}
                    </Badge>
                  </div>
                  <div className='text-sm text-gray-500'>
                    {Math.round(insight.confidence * 100)}% confidence
                  </div>
                </div>

                {insight.insights.length > 0 && (
                  <div className='mb-2'>
                    <h5 className='text-sm font-medium text-gray-700 mb-1'>
                      Insights:
                    </h5>
                    <ul className='text-sm text-gray-600 list-disc list-inside'>
                      {insight.insights.map((insightText, index) => (
                        <li key={index}>{insightText}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insight.recommendations.length > 0 && (
                  <div>
                    <h5 className='text-sm font-medium text-gray-700 mb-1'>
                      Recommendations:
                    </h5>
                    <ul className='text-sm text-blue-600 list-disc list-inside'>
                      {insight.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insight.tags.length > 0 && (
                  <div className='mt-2'>
                    <div className='flex flex-wrap gap-1'>
                      {insight.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-xs'
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New AI Features */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Smart Alerts */}
        <SmartAlerts
          currentSpending={{
            'Food & Dining': 650,
            Transportation: 420,
            Entertainment: 180,
            Utilities: 150,
            Shopping: 320,
          }}
          budgets={{
            'Food & Dining': 600,
            Transportation: 400,
            Entertainment: 200,
            Utilities: 180,
            Shopping: 300,
          }}
          previousMonthSpending={{
            'Food & Dining': 580,
            Transportation: 450,
            Entertainment: 220,
            Utilities: 160,
            Shopping: 280,
          }}
          income={5000}
        />

        {/* Expense Forecast */}
        <ExpenseForecast
          historicalData={[
            {
              month: '2024-01',
              spending: {
                'Food & Dining': 580,
                Transportation: 450,
                Entertainment: 220,
                Utilities: 160,
                Shopping: 280,
              },
              total: 1690,
            },
            {
              month: '2024-02',
              spending: {
                'Food & Dining': 620,
                Transportation: 420,
                Entertainment: 180,
                Utilities: 150,
                Shopping: 320,
              },
              total: 1690,
            },
            {
              month: '2024-03',
              spending: {
                'Food & Dining': 650,
                Transportation: 420,
                Entertainment: 180,
                Utilities: 150,
                Shopping: 320,
              },
              total: 1720,
            },
          ]}
          currentMonth='2024-03'
        />
      </div>

      {/* Smart Categorization */}
      <SmartCategorization
        onCategorize={result => {
          console.log('AI Categorization:', result);
        }}
        userHistory={[
          {
            description: 'Starbucks Coffee',
            category: 'Food & Dining',
            tags: ['coffee', 'beverage'],
            userCorrected: false,
          },
          {
            description: 'Shell Gas Station',
            category: 'Transportation',
            tags: ['gas', 'fuel'],
            userCorrected: true,
          },
        ]}
      />
    </div>
  );
}
