'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Share, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Brain,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'

// AI-Generated Monthly Report Data
const monthlyReportData = {
  month: 'January 2024',
  totalIncome: 8500,
  totalExpenses: 6234,
  netSavings: 2266,
  savingsRate: 26.7,
  topCategories: [
    { name: 'Housing', amount: 2100, percentage: 33.7, trend: 'stable' },
    { name: 'Food & Dining', amount: 1200, percentage: 19.2, trend: 'up' },
    { name: 'Transportation', amount: 800, percentage: 12.8, trend: 'down' },
    { name: 'Entertainment', amount: 600, percentage: 9.6, trend: 'up' },
    { name: 'Utilities', amount: 500, percentage: 8.0, trend: 'stable' },
  ],
  aiInsights: [
    {
      type: 'spending_analysis',
      title: 'Dining Expenses Increased',
      description: 'Your dining expenses increased by 25% compared to last month, spending $1,200 vs $960.',
      impact: 'high',
      recommendation: 'Consider setting a monthly dining budget of $1,000 to maintain your savings goals.',
      savingsPotential: 200
    },
    {
      type: 'budget_optimization',
      title: 'Transportation Savings',
      description: 'You saved $150 on transportation this month by using public transit more often.',
      impact: 'positive',
      recommendation: 'Continue this trend to save an estimated $1,800 annually.',
      savingsPotential: 0
    },
    {
      type: 'goal_progress',
      title: 'Emergency Fund Progress',
      description: 'You\'re 78% towards your $10,000 emergency fund goal with $7,800 saved.',
      impact: 'high',
      recommendation: 'At your current savings rate, you\'ll reach your goal in 2.3 months.',
      savingsPotential: 0
    }
  ],
  goals: [
    {
      name: 'Emergency Fund',
      target: 10000,
      current: 7800,
      progress: 78,
      status: 'on_track'
    },
    {
      name: 'Vacation Fund',
      target: 5000,
      current: 3200,
      progress: 64,
      status: 'on_track'
    },
    {
      name: 'Home Down Payment',
      target: 50000,
      current: 15000,
      progress: 30,
      status: 'behind'
    }
  ],
  recommendations: [
    'Consider investing your extra $2,266 monthly savings for long-term growth',
    'Switch to StoreX for groceries to save an estimated $200/month',
    'Set up automatic transfers to your emergency fund to reach your goal faster',
    'Review your entertainment budget - you spent 15% more than planned'
  ]
}

export function MonthlyReport() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    // Simulate AI report generation
    setTimeout(() => setIsGenerating(false), 2000)
  }

  const handleDownload = () => {
    // Simulate PDF download
    console.log('Downloading monthly report...')
  }

  const handleShare = () => {
    // Simulate sharing functionality
    console.log('Sharing monthly report...')
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <div className="h-4 w-4 bg-gray-300 rounded-full" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600'
      case 'down': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getGoalStatus = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800'
      case 'behind': return 'bg-yellow-100 text-yellow-800'
      case 'ahead': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monthly Report</h2>
          <p className="text-muted-foreground">
            AI-generated insights for {monthlyReportData.month}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            variant="outline"
          >
            <Brain className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate New Report'}
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${monthlyReportData.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${monthlyReportData.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +1.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +${monthlyReportData.netSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyReportData.savingsRate}% savings rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              85/100
            </div>
            <p className="text-xs text-muted-foreground">
              Excellent financial health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Top Spending Categories</span>
          </CardTitle>
          <CardDescription>
            Your biggest expense categories this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyReportData.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.percentage}% of total expenses
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">${category.amount.toLocaleString()}</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(category.trend)}
                    <span className={`text-sm ${getTrendColor(category.trend)}`}>
                      {category.trend === 'up' ? '↗' : category.trend === 'down' ? '↘' : '→'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Insights & Recommendations</span>
          </CardTitle>
          <CardDescription>
            Personalized analysis of your financial patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyReportData.aiInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <p className="text-sm text-blue-700 mb-2">
                      💡 {insight.recommendation}
                    </p>
                    {insight.savingsPotential > 0 && (
                      <Badge variant="outline" className="text-green-600">
                        Potential Savings: ${insight.savingsPotential}/month
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Financial Goals Progress</span>
          </CardTitle>
          <CardDescription>
            Track your progress towards financial milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyReportData.goals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.name}</span>
                  <Badge className={getGoalStatus(goal.status)}>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>${goal.current.toLocaleString()}</span>
                    <span>${goal.target.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {goal.progress}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>AI Recommendations</span>
          </CardTitle>
          <CardDescription>
            Actionable steps to improve your financial health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyReportData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                </div>
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
