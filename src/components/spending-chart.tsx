'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { useState } from 'react'

const spendingData = [
  { month: 'Jan', amount: 4200, budget: 5000 },
  { month: 'Feb', amount: 3800, budget: 5000 },
  { month: 'Mar', amount: 4500, budget: 5000 },
  { month: 'Apr', amount: 5200, budget: 5000 },
  { month: 'May', amount: 4800, budget: 5000 },
  { month: 'Jun', amount: 5500, budget: 5000 },
]

const categoryData = [
  { name: 'Housing', value: 35, color: '#8884d8' },
  { name: 'Food', value: 25, color: '#82ca9d' },
  { name: 'Transportation', value: 15, color: '#ffc658' },
  { name: 'Entertainment', value: 10, color: '#ff7300' },
  { name: 'Utilities', value: 8, color: '#00ff00' },
  { name: 'Other', value: 7, color: '#ff00ff' },
]

const monthlyTrendData = [
  { month: 'Jan', income: 8000, expenses: 4200, savings: 3800 },
  { month: 'Feb', income: 8200, expenses: 3800, savings: 4400 },
  { month: 'Mar', income: 8000, expenses: 4500, savings: 3500 },
  { month: 'Apr', income: 8500, expenses: 5200, savings: 3300 },
  { month: 'May', income: 8500, expenses: 4800, savings: 3700 },
  { month: 'Jun', income: 8500, expenses: 5500, savings: 3000 },
]

type ChartType = 'line' | 'bar' | 'pie'

export function SpendingChart() {
  const [chartType, setChartType] = useState<ChartType>('line')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Spending Analysis</span>
            </CardTitle>
            <CardDescription>
              Track your spending patterns and budget performance
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded ${chartType === 'line' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded ${chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded ${chartType === 'pie' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              <PieChartIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' && (
              <LineChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name === 'amount' ? 'Spent' : 'Budget']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Spent"
                />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Budget"
                />
              </LineChart>
            )}
            
            {chartType === 'bar' && (
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Savings']}
                />
                <Bar dataKey="income" fill="#82ca9d" name="Income" />
                <Bar dataKey="expenses" fill="#8884d8" name="Expenses" />
                <Bar dataKey="savings" fill="#ffc658" name="Savings" />
              </BarChart>
            )}
            
            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
