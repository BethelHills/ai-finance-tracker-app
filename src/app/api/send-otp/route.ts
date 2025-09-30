import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/lib/otp-service';

// Simple in-memory storage for demo purposes
// In production, use Redis, database, or secure session storage
const otpStorage = new Map<
  string,
  { otp: string; expires: number; attempts: number }
>();

function storeOTP(email: string, otp: string, expiresInMinutes: number = 5) {
  const expires = Date.now() + expiresInMinutes * 60 * 1000;
  otpStorage.set(email, { otp, expires, attempts: 0 });
  console.log(
    `💾 OTP stored for ${email}: ${otp} (expires in ${expiresInMinutes} minutes)`
  );
}

// Export the storage so it can be shared with verify-otp
export { otpStorage };

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`📧 Sending ${type} OTP to ${email}: ${otp}`);

    // Send OTP via Resend
    await sendOTP(email, otp);

    // Store OTP for verification
    storeOTP(email, otp, 5); // 5 minutes expiry

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // For development only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('❌ Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
