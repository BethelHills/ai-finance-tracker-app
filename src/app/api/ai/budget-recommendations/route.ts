import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { currentSpending, income, goals } = await request.json()
    
    if (!currentSpending || !income || !goals) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const recommendations = await AIService.generateBudgetRecommendations(
      currentSpending,
      income,
      goals
    )
    
    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error generating budget recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate budget recommendations' },
      { status: 500 }
    )
  }
}
