'use client'

import { useState, useEffect, useCallback } from 'react'
import { AIService, FinancialData, AIInsight } from '@/lib/ai-service'

interface UseAIInsightsOptions {
  autoGenerate?: boolean
  refreshInterval?: number
  onError?: (error: Error) => void
}

interface UseAIInsightsReturn {
  insights: AIInsight[]
  isLoading: boolean
  error: Error | null
  generateInsights: (data: FinancialData) => Promise<void>
  refreshInsights: () => Promise<void>
  clearInsights: () => void
}

export function useAIInsights(options: UseAIInsightsOptions = {}): UseAIInsightsReturn {
  const {
    autoGenerate = false,
    refreshInterval = 0,
    onError
  } = options

  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const generateInsights = useCallback(async (data: FinancialData) => {
    setIsLoading(true)
    setError(null)

    try {
      const newInsights = await AIService.generateFinancialInsights(data)
      setInsights(newInsights)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate insights')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  const refreshInsights = useCallback(async () => {
    if (insights.length > 0) {
      // Re-generate insights with current data
      // This would typically fetch fresh data from your API
      console.log('Refreshing insights...')
    }
  }, [insights.length])

  const clearInsights = useCallback(() => {
    setInsights([])
    setError(null)
  }, [])

  // Auto-generate insights when data changes
  useEffect(() => {
    if (autoGenerate) {
      // This would typically be triggered by data changes
      console.log('Auto-generating insights...')
    }
  }, [autoGenerate])

  // Refresh insights at intervals
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refreshInsights, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, refreshInsights])

  return {
    insights,
    isLoading,
    error,
    generateInsights,
    refreshInsights,
    clearInsights
  }
}

// Specialized hook for transaction categorization
export function useTransactionCategorization() {
  const [isCategorizing, setIsCategorizing] = useState(false)
  const [categorizationHistory, setCategorizationHistory] = useState<Array<{
    id: string
    description: string
    amount: number
    category: string
    confidence: number
    timestamp: Date
  }>>([])

  const categorizeTransaction = useCallback(async (description: string, amount: number) => {
    setIsCategorizing(true)
    
    try {
      const result = await AIService.categorizeTransaction(description, amount)
      
      const categorization = {
        id: Math.random().toString(36).substr(2, 9),
        description,
        amount,
        category: result.category,
        confidence: result.confidence,
        timestamp: new Date()
      }
      
      setCategorizationHistory(prev => [categorization, ...prev.slice(0, 49)]) // Keep last 50
      
      return result
    } catch (error) {
      console.error('Categorization failed:', error)
      throw error
    } finally {
      setIsCategorizing(false)
    }
  }, [])

  const getCategorizationAccuracy = useCallback(() => {
    if (categorizationHistory.length === 0) return 0
    
    const highConfidence = categorizationHistory.filter(c => c.confidence > 0.8).length
    return (highConfidence / categorizationHistory.length) * 100
  }, [categorizationHistory])

  return {
    categorizeTransaction,
    isCategorizing,
    categorizationHistory,
    getCategorizationAccuracy
  }
}

// Hook for budget optimization
export function useBudgetOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationHistory, setOptimizationHistory] = useState<Array<{
    id: string
    originalBudget: Record<string, number>
    optimizedBudget: Record<string, number>
    savingsPotential: number
    timestamp: Date
  }>>([])

  const optimizeBudget = useCallback(async (
    currentSpending: Record<string, number>,
    income: number,
    goals: string[]
  ) => {
    setIsOptimizing(true)
    
    try {
      const result = await AIService.generateBudgetRecommendations(
        currentSpending,
        income,
        goals
      )
      
      const optimization = {
        id: Math.random().toString(36).substr(2, 9),
        originalBudget: currentSpending,
        optimizedBudget: result.recommendedBudgets,
        savingsPotential: result.savingsPotential,
        timestamp: new Date()
      }
      
      setOptimizationHistory(prev => [optimization, ...prev.slice(0, 19)]) // Keep last 20
      
      return result
    } catch (error) {
      console.error('Budget optimization failed:', error)
      throw error
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  const getTotalSavingsPotential = useCallback(() => {
    return optimizationHistory.reduce((total, opt) => total + opt.savingsPotential, 0)
  }, [optimizationHistory])

  return {
    optimizeBudget,
    isOptimizing,
    optimizationHistory,
    getTotalSavingsPotential
  }
}
