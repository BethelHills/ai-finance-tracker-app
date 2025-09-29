import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp-service';

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { success: false, error: 'Email and type are required' },
        { status: 400 }
      );
    }

    if (!['signup', 'login'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type' },
        { status: 400 }
      );
    }

    const result = await otpService.sendOTP(email, type as 'signup' | 'login');

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
