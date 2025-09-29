import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    
    return NextResponse.json({
      hasEmailConfig,
      emailUser: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
      emailPassword: process.env.EMAIL_PASSWORD ? 'Configured' : 'Not configured',
      nodeEnv: process.env.NODE_ENV,
      message: hasEmailConfig 
        ? 'Email credentials are configured - will try real email sending'
        : 'No email credentials - using development email service'
    });
  } catch (error: any) {
    console.error('API /api/check-email-config error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
