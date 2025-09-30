'use client';

import { OTPLoginExample } from '@/components/auth/otp-login-example';

export default function TestOTPPage() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            🚀 Resend OTP Demo
          </h1>
          <p className='text-gray-600'>
            Test the lightning-fast OTP system powered by Resend
          </p>
        </div>

        <OTPLoginExample />

        <div className='mt-8 text-center'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h3 className='font-semibold text-blue-900 mb-2'>⚡ Features</h3>
            <ul className='text-sm text-blue-800 space-y-1'>
              <li>• Sub-second email delivery via Resend</li>
              <li>• 6-digit OTP with 5-minute expiry</li>
              <li>• 3 attempt limit for security</li>
              <li>• Auto-cleanup of expired OTPs</li>
              <li>• Development mode shows OTP in console</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
