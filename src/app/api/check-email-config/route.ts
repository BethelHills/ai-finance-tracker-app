import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasResendKey = !!(
      process.env.RESEND_API_KEY &&
      process.env.RESEND_API_KEY !== 'your_resend_api_key'
    );
    const hasEmailConfig = !!(
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD &&
      process.env.EMAIL_USER !== 'your-email@gmail.com' &&
      process.env.EMAIL_PASSWORD !== 'your-app-password'
    );

    let service = 'Development Email Service';
    if (hasResendKey) {
      service = 'Resend (Primary)';
    } else if (hasEmailConfig) {
      service = 'SMTP Email Service';
    }

    return NextResponse.json({
      hasResendKey,
      hasEmailConfig,
      service,
      resendApiKey: process.env.RESEND_API_KEY
        ? 'Configured'
        : 'Not configured',
      emailUser: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
      emailPassword: process.env.EMAIL_PASSWORD
        ? 'Configured'
        : 'Not configured',
      nodeEnv: process.env.NODE_ENV,
      message: hasResendKey
        ? 'Resend API key configured - using Resend email service (fastest)'
        : hasEmailConfig
          ? 'SMTP credentials configured - using SMTP email service'
          : 'No email credentials - using development email service',
    });
  } catch (error: any) {
    console.error('API /api/check-email-config error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
