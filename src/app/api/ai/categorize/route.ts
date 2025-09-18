import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { description, amount } = await request.json()
    
    if (!description || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing description or amount' },
        { status: 400 }
      )
    }

    const result = await AIService.categorizeTransaction(description, amount)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error categorizing transaction:', error)
    return NextResponse.json(
      { error: 'Failed to categorize transaction' },
      { status: 500 }
    )
  }
}
