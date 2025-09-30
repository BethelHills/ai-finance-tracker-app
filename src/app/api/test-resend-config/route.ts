import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/fast-email-service';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;
    
    console.log('🔍 Environment Check:');
    console.log('RESEND_API_KEY exists:', !!resendApiKey);
    console.log('RESEND_API_KEY length:', resendApiKey?.length || 0);
    console.log('EMAIL_FROM:', emailFrom);
    
    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not found in environment variables',
        config: {
          resendApiKey: !!resendApiKey,
          emailFrom: emailFrom,
        }
      }, { status: 500 });
    }

    // Test email sending
    const testEmail = 'test@example.com';
    const testSubject = 'Test Email from AI Finance Tracker';
    const testHtml = '<p>This is a test email to verify Resend configuration.</p>';

    console.log('📧 Attempting to send test email...');
    
    try {
      const result = await sendEmail(testEmail, testSubject, testHtml);
      
      return NextResponse.json({
        success: true,
        message: 'Resend configuration is working!',
        emailId: result.data?.id,
        config: {
          resendApiKey: !!resendApiKey,
          emailFrom: emailFrom,
        }
      });
    } catch (emailError: any) {
      console.error('❌ Email sending failed:', emailError);
      
      return NextResponse.json({
        success: false,
        error: `Email sending failed: ${emailError.message}`,
        config: {
          resendApiKey: !!resendApiKey,
          emailFrom: emailFrom,
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Configuration test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Configuration test failed',
    }, { status: 500 });
  }
}
