'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { ExpenseTrendsChart } from '@/components/charts/expense-trends-chart';
import { CategoryBreakdownChart } from '@/components/charts/category-breakdown-chart';
import { ExportService } from '@/lib/export-service';
import { useToast } from '@/hooks/use-toast';

interface EnhancedReportsDashboardProps {
  className?: string;
}

// Mock data for demonstration
const mockTrendData = [
  { month: 'Aug 2023', expenses: 3200, income: 5000, savings: 1800 },
  { month: 'Sep 2023', expenses: 3400, income: 5000, savings: 1600 },
  { month: 'Oct 2023', expenses: 3100, income: 5200, savings: 2100 },
  { month: 'Nov 2023', expenses: 3600, income: 5000, savings: 1400 },
  { month: 'Dec 2023', expenses: 4200, income: 5500, savings: 1300 },
  { month: 'Jan 2024', expenses: 3800, income: 5200, savings: 1400 },
  { month: 'Feb 2024', expenses: 3500, income: 5200, savings: 1700 },
];

const mockCategoryData = [
  { category: 'Housing', amount: 1200, percentage: 34.3, color: '#ef4444' },
  {
    category: 'Food & Dining',
    amount: 650,
    percentage: 18.6,
    color: '#f97316',
  },
  {
    category: 'Transportation',
    amount: 420,
    percentage: 12.0,
    color: '#eab308',
  },
  { category: 'Entertainment', amount: 320, percentage: 9.1, color: '#22c55e' },
  { category: 'Utilities', amount: 280, percentage: 8.0, color: '#06b6d4' },
  { category: 'Healthcare', amount: 200, percentage: 5.7, color: '#3b82f6' },
  { category: 'Shopping', amount: 180, percentage: 5.1, color: '#8b5cf6' },
  { category: 'Other', amount: 250, percentage: 7.1, color: '#ec4899' },
];

const mockTransactionData = [
  {
    date: '2024-02-15',
    description: 'Grocery Shopping',
    category: 'Food & Dining',
    type: 'expense' as const,
    amount: 85.5,
    account: 'Chase Checking',
  },
  {
    date: '2024-02-14',
    description: 'Salary Deposit',
    category: 'Income',
    type: 'income' as const,
    amount: 2500.0,
    account: 'Chase Checking',
  },
  {
    date: '2024-02-13',
    description: 'Gas Station',
    category: 'Transportation',
    type: 'expense' as const,
    amount: 45.2,
    account: 'Chase Credit Card',
  },
  {
    date: '2024-02-12',
    description: 'Netflix Subscription',
    category: 'Entertainment',
    type: 'expense' as const,
    amount: 15.99,
    account: 'Chase Credit Card',
  },
  {
    date: '2024-02-11',
    description: 'Electric Bill',
    category: 'Utilities',
    type: 'expense' as const,
    amount: 120.75,
    account: 'Chase Checking',
  },
];

export function EnhancedReportsDashboard({
  className,
}: EnhancedReportsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedCategoryPeriod, setSelectedCategoryPeriod] =
    useState('current');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const chartRef = useRef<HTMLDivElement>(null);
  const categoryChartRef = useRef<HTMLDivElement>(null);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      const exportData = {
        transactions: mockTransactionData,
        summary: {
          totalIncome: 2500,
          totalExpenses: 268.44,
          netAmount: 2231.56,
          period: 'February 2024',
        },
      };

      await ExportService.exportToCSV(exportData);

      toast.success('Your transactions have been exported to CSV.');
    } catch (error) {
      toast.error('There was an error exporting your data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);

      const exportData = {
        transactions: mockTransactionData,
        summary: {
          totalIncome: 2500,
          totalExpenses: 268.44,
          netAmount: 2231.56,
          period: 'February 2024',
        },
      };

      await ExportService.exportToPDF(
        exportData,
        chartRef.current || undefined
      );

      toast.success('Your financial report has been exported to PDF.');
    } catch (error) {
      toast.error('There was an error exporting your report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportChartsPDF = async () => {
    try {
      setIsExporting(true);

      const chartElements = [];
      if (chartRef.current) chartElements.push(chartRef.current);
      if (categoryChartRef.current)
        chartElements.push(categoryChartRef.current);

      if (chartElements.length === 0) {
        toast.error('There are no charts to export.');
        return;
      }

      await ExportService.exportChartsToPDF(
        chartElements,
        'Financial Charts Report'
      );

      toast.success('Your charts have been exported to PDF.');
    } catch (error) {
      toast.error('There was an error exporting your charts.');
    } finally {
      setIsExporting(false);
    }
  };

  const getTotalExpenses = () => {
    return mockCategoryData.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Reports & Analytics
          </h1>
          <p className='text-muted-foreground'>
            Comprehensive financial reports and data visualization
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='6months'>Last 6 Months</SelectItem>
              <SelectItem value='12months'>Last 12 Months</SelectItem>
              <SelectItem value='2years'>Last 2 Years</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Download className='h-5 w-5' />
            <span>Export Reports</span>
          </CardTitle>
          <CardDescription>
            Export your financial data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-3'>
            <Button
              onClick={handleExportCSV}
              disabled={isExporting}
              variant='outline'
            >
              <FileText className='h-4 w-4 mr-2' />
              Export CSV
            </Button>

            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant='outline'
            >
              <FileText className='h-4 w-4 mr-2' />
              Export PDF Report
            </Button>

            <Button
              onClick={handleExportChartsPDF}
              disabled={isExporting}
              variant='outline'
            >
              <BarChart3 className='h-4 w-4 mr-2' />
              Export Charts PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Reports Tabs */}
      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='trends'>Trends</TabsTrigger>
          <TabsTrigger value='categories'>Categories</TabsTrigger>
          <TabsTrigger value='detailed'>Detailed</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>
                  Key metrics for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Total Income</span>
                  <Badge variant='outline' className='text-green-600'>
                    $17,500
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Total Expenses</span>
                  <Badge variant='outline' className='text-red-600'>
                    $24,500
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Net Savings</span>
                  <Badge variant='outline' className='text-blue-600'>
                    $12,200
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Savings Rate</span>
                  <Badge variant='outline' className='text-purple-600'>
                    49.7%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>
                  Your highest expense categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {mockCategoryData.slice(0, 5).map((category, index) => (
                    <div
                      key={category.category}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center space-x-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{ backgroundColor: category.color }}
                        />
                        <span className='text-sm font-medium'>
                          {category.category}
                        </span>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>
                          ${category.amount}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {category.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='trends' className='space-y-6'>
          <div ref={chartRef}>
            <ExpenseTrendsChart
              data={mockTrendData}
              period={selectedPeriod as any}
            />
          </div>
        </TabsContent>

        <TabsContent value='categories' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Category Breakdown</h3>
            <Select
              value={selectedCategoryPeriod}
              onValueChange={setSelectedCategoryPeriod}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Select period' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='current'>Current Month</SelectItem>
                <SelectItem value='lastMonth'>Last Month</SelectItem>
                <SelectItem value='last3Months'>Last 3 Months</SelectItem>
                <SelectItem value='lastYear'>Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div ref={categoryChartRef}>
            <CategoryBreakdownChart
              data={mockCategoryData}
              totalAmount={getTotalExpenses()}
              period={selectedCategoryPeriod as any}
            />
          </div>
        </TabsContent>

        <TabsContent value='detailed' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Transaction Report</CardTitle>
              <CardDescription>
                Complete breakdown of all transactions for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockTransactionData.map((transaction, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className='font-medium'>{transaction.description}</p>
                        <p className='text-sm text-muted-foreground'>
                          {transaction.date} • {transaction.category} •{' '}
                          {transaction.account}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p
                        className={`font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
