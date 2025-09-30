import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for demo purposes
// In production, use Redis, database, or secure session storage
const otpStorage = new Map<
  string,
  { otp: string; expires: number; attempts: number }
>();

// Export the storage so it can be shared with send-otp
export { otpStorage };

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const storedData = otpStorage.get(email);

    if (!storedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'No OTP found for this email. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Check if OTP has expired (5 minutes)
    if (Date.now() > storedData.expires) {
      otpStorage.delete(email);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempt limit (max 3 attempts)
    if (storedData.attempts >= 3) {
      otpStorage.delete(email);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed attempts. Please request a new OTP.',
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts++;
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - remove it from storage
    otpStorage.delete(email);

    console.log(`✅ OTP verified successfully for ${email}`);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('❌ Error in verify-otp API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to store OTP (called from send-otp)
export function storeOTP(
  email: string,
  otp: string,
  expiresInMinutes: number = 5
) {
  const expires = Date.now() + expiresInMinutes * 60 * 1000;
  otpStorage.set(email, { otp, expires, attempts: 0 });
  console.log(
    `💾 OTP stored for ${email}: ${otp} (expires in ${expiresInMinutes} minutes)`
  );
}
