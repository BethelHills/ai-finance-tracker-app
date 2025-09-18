import { NextRequest, NextResponse } from 'next/server'
import { AIService, FinancialData } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const data: FinancialData = await request.json()
    
    if (!data.transactions || !data.budgets || !data.goals) {
      return NextResponse.json(
        { error: 'Missing required data fields' },
        { status: 400 }
      )
    }

    const insights = await AIService.generateFinancialInsights(data)
    
    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
