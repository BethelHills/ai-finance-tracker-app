import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { currentSpending, budgets, previousMonthSpending, income } =
      await request.json();

    if (
      !currentSpending ||
      !budgets ||
      !previousMonthSpending ||
      income === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required financial data' },
        { status: 400 }
      );
    }

    const result = await AIService.generateSmartAlerts(
      currentSpending,
      budgets,
      previousMonthSpending,
      income
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating smart alerts:', error);
    return NextResponse.json(
      { error: 'Failed to generate smart alerts' },
      { status: 500 }
    );
  }
}
