import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SecureBusinessServer } from '@/lib/secure-business-server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transactionData = await request.json();
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await SecureBusinessServer.processTransaction(
      session.user.id,
      transactionData,
      {
        userId: session.user.id,
        ipAddress: clientIP,
        userAgent,
      }
    );

    return NextResponse.json({ 
      success: true,
      transaction: result 
    });
  } catch (error) {
    console.error('Secure transaction processing error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Transaction processing failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
