import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/fast-email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('🧪 Testing email delivery to:', email);
    console.log('📧 Sender:', process.env.EMAIL_FROM);
    console.log('🔑 Resend API Key configured:', !!process.env.RESEND_API_KEY);

    // Send a test email
    const testSubject = '🧪 AI Finance Tracker - Email Delivery Test';
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">✅ Email Delivery Test Successful!</h2>
        <p>If you're reading this, your email delivery is working perfectly!</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">📧 Test Details:</h3>
          <ul>
            <li><strong>Recipient:</strong> ${email}</li>
            <li><strong>Sender:</strong> ${process.env.EMAIL_FROM}</li>
            <li><strong>Service:</strong> Resend API</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          </ul>
        </div>
        <p style="color: #059669;">🎉 Your AI Finance Tracker OTP system is ready to use!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is a test email from AI Finance Tracker. 
          If you received this, your email configuration is working correctly.
        </p>
      </div>
    `;

    const result = await sendEmail(email, testSubject, testHtml);
    
    console.log('✅ Test email sent successfully:', result.data?.id);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      emailId: result.data?.id,
      recipient: email,
      sender: process.env.EMAIL_FROM,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Test email failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email',
      details: {
        recipient: email,
        sender: process.env.EMAIL_FROM,
        resendConfigured: !!process.env.RESEND_API_KEY
      }
    }, { status: 500 });
  }
}
