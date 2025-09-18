'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Download,
  Filter
} from 'lucide-react'

// AI-Generated Mock Data
const monthlySpendingData = [
  { month: 'Jan', income: 8500, expenses: 6200, savings: 2300 },
  { month: 'Feb', income: 8500, expenses: 5800, savings: 2700 },
  { month: 'Mar', income: 9000, expenses: 6500, savings: 2500 },
  { month: 'Apr', income: 8500, expenses: 7200, savings: 1300 },
  { month: 'May', income: 9000, expenses: 6800, savings: 2200 },
  { month: 'Jun', income: 8500, expenses: 7500, savings: 1000 },
]

const categorySpendingData = [
  { name: 'Housing', value: 2100, color: '#8884d8' },
  { name: 'Food', value: 1200, color: '#82ca9d' },
  { name: 'Transportation', value: 800, color: '#ffc658' },
  { name: 'Entertainment', value: 600, color: '#ff7300' },
  { name: 'Utilities', value: 500, color: '#00ff00' },
  { name: 'Healthcare', value: 400, color: '#ff00ff' },
  { name: 'Shopping', value: 300, color: '#00ffff' },
  { name: 'Other', value: 200, color: '#ffff00' },
]

const weeklyTrendData = [
  { week: 'Week 1', amount: 1200 },
  { week: 'Week 2', amount: 1500 },
  { week: 'Week 3', amount: 1100 },
  { week: 'Week 4', amount: 1800 },
  { week: 'Week 5', amount: 1400 },
]

const aiInsightsData = [
  {
    title: 'Spending Alert',
    description: 'You spent 25% more on dining this month',
    type: 'warning',
    impact: 'high',
    recommendation: 'Consider setting a dining budget of $400/month'
  },
  {
    title: 'Savings Opportunity',
    description: 'You can save $200/month by switching grocery stores',
    type: 'opportunity',
    impact: 'medium',
    recommendation: 'Try StoreX for 15% better prices on groceries'
  },
  {
    title: 'Goal Progress',
    description: 'You\'re 78% towards your emergency fund goal',
    type: 'success',
    impact: 'high',
    recommendation: 'Keep up the great work! You\'ll reach your goal in 2.3 months'
  }
]

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedChart, setSelectedChart] = useState('bar')

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-600 bg-red-50 border-red-200'
      case 'opportunity': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <TrendingDown className="h-4 w-4" />
      case 'opportunity': return <DollarSign className="h-4 w-4" />
      case 'success': return <TrendingUp className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            AI-powered insights into your financial patterns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        {aiInsightsData.map((insight, index) => (
          <Card key={index} className={`${getInsightColor(insight.type)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                {getInsightIcon(insight.type)}
                <CardTitle className="text-sm">{insight.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{insight.description}</p>
              <p className="text-xs opacity-75">{insight.recommendation}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Spending Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Spending Trend</CardTitle>
                <CardDescription>Income vs Expenses over time</CardDescription>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant={selectedChart === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChart('bar')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedChart === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChart('line')}
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === 'bar' ? (
                  <BarChart data={monthlySpendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`$${value}`, name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Savings']}
                    />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    <Bar dataKey="savings" fill="#3b82f6" name="Savings" />
                  </BarChart>
                ) : (
                  <LineChart data={monthlySpendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`$${value}`, name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Savings']}
                    />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} name="Savings" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Spending Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>This month's expense breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categorySpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend Area Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Spending Trend</CardTitle>
            <CardDescription>Track your spending patterns week by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Spending']} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Weekly Spending"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>AI Recommendations</span>
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Budget Optimization</h4>
              <p className="text-sm text-muted-foreground mb-2">
                You're spending 15% more on dining than last month. Consider setting a monthly dining budget.
              </p>
              <Button size="sm" variant="outline">Set Budget</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Savings Opportunity</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Switch to StoreX for groceries to save an estimated $200/month.
              </p>
              <Button size="sm" variant="outline">Learn More</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Goal Progress</h4>
              <p className="text-sm text-muted-foreground mb-2">
                You're 78% towards your emergency fund goal. Keep up the great work!
              </p>
              <Button size="sm" variant="outline">View Goals</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Investment Suggestion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Consider investing your extra $2,300 monthly savings for long-term growth.
              </p>
              <Button size="sm" variant="outline">Explore Options</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
