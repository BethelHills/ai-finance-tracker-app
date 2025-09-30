import { NextResponse } from 'next/server';
import { resendEmailService } from '@/lib/resend-email-service';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing Resend service for:', email);

    const result = await resendEmailService.sendOTPEmail(
      email,
      '123456',
      'signup'
    );

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? 'Resend email sent successfully!'
        : 'Resend email failed',
      error: result.error,
    });
  } catch (error: any) {
    console.error('API /api/test-resend error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
