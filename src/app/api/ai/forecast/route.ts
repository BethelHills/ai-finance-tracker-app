import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { historicalData, currentMonth } = await request.json();

    if (!historicalData || !currentMonth) {
      return NextResponse.json(
        { error: 'Missing historical data or current month' },
        { status: 400 }
      );
    }

    const result = await AIService.generateExpenseForecast(
      historicalData,
      currentMonth
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating expense forecast:', error);
    return NextResponse.json(
      { error: 'Failed to generate expense forecast' },
      { status: 500 }
    );
  }
}
