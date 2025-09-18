'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Brain, 
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  PieChart,
  BarChart3,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { AIInsights } from '@/components/ai-insights'
import { SpendingChart } from '@/components/spending-chart'
import { RecentTransactions } from '@/components/recent-transactions'
import { BudgetOverview } from '@/components/budget-overview'

// Enhanced mock data with more realistic values
const mockData = {
  totalBalance: 15420.50,
  monthlyIncome: 8500.00,
  monthlyExpenses: 6234.50,
  monthlySavings: 2265.50,
  budgetUtilization: 73,
  netWorth: 45620.30,
  creditScore: 785,
  investmentValue: 12340.20,
  emergencyFund: 8500.00,
  monthlyTrend: 12.5,
  aiInsights: [
    {
      id: 1,
      type: 'spending_analysis',
      title: 'Unusual Spending Detected',
      description: 'Your dining expenses increased by 45% this month compared to last month.',
      priority: 'high',
      recommendation: 'Consider setting a dining budget of $400/month to maintain your savings goals.',
      icon: AlertTriangle,
      color: 'text-red-500',
      action: 'Set Budget Alert'
    },
    {
      id: 2,
      type: 'budget_optimization',
      title: 'Budget Optimization Opportunity',
      description: 'You can save $200/month by switching to a different grocery store.',
      priority: 'medium',
      recommendation: 'Based on your shopping patterns, StoreX offers 15% better prices.',
      icon: Target,
      color: 'text-blue-500',
      action: 'View Recommendations'
    },
    {
      id: 3,
      type: 'goal_progress',
      title: 'Emergency Fund Goal',
      description: 'You\'re 78% towards your $10,000 emergency fund goal.',
      priority: 'low',
      recommendation: 'Keep up the great work! You\'ll reach your goal in 2.3 months.',
      icon: CheckCircle,
      color: 'text-green-500',
      action: 'View Progress'
    }
  ]
}

export function EnhancedDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your comprehensive financial overview with AI insights.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <Badge variant="secondary" className="ai-gradient text-white">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">View:</span>
        {['week', 'month', 'quarter', 'year'].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className="capitalize"
          >
            {period}
          </Button>
        ))}
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{mockData.monthlyTrend}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.monthlyIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.monthlyExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +1.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.netWorth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.creditScore}</div>
            <p className="text-xs text-muted-foreground">
              Excellent range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.investmentValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.4% this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockData.emergencyFund.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              8.5 months expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* AI Insights */}
        <div className="lg:col-span-2">
          <AIInsights insights={mockData.aiInsights} />
        </div>

        {/* Budget Overview */}
        <div>
          <BudgetOverview utilization={mockData.budgetUtilization} />
        </div>

        {/* Spending Chart */}
        <div className="lg:col-span-2">
          <SpendingChart />
        </div>

        {/* Recent Transactions */}
        <div>
          <RecentTransactions />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <CreditCard className="h-6 w-6" />
              <span>Add Transaction</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span>Set Budget</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <PieChart className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
