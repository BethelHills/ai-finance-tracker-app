import { NextRequest, NextResponse } from 'next/server';
import { NigerianPaymentService } from '@/lib/nigerian-payment-service';

export async function GET(request: NextRequest) {
  try {
    const banks = await NigerianPaymentService.getBanks();
    
    return NextResponse.json({ banks });
  } catch (error) {
    console.error('Error fetching banks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banks' },
      { status: 500 }
    );
  }
}
