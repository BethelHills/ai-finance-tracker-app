'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

export default function SimpleSecureLogin() {
  const { signIn, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loadingStep, setLoadingStep] = useState(false);
  const [message, setMessage] = useState('');

  // Step 1: Check password
  const handlePasswordCheck = async () => {
    if (!email || !password) {
      setMessage('❌ Please fill in all fields');
      return;
    }

    try {
      setLoadingStep(true);
      setMessage('🔐 Verifying credentials...');

      // Verify password with our auth system
      const { data, error } = await signIn(email, password);

      if (error) {
        throw new Error(error.message || 'Invalid email or password');
      }

      // Password verified, now send OTP
      setMessage('✅ Password verified. Sending OTP...');
      
      const otpResponse = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'login',
        }),
      });

      const otpResult = await otpResponse.json();

      if (!otpResult.success) {
        throw new Error(otpResult.error || 'Failed to send OTP');
      }

      setMessage('✅ Password verified. OTP sent to your email.');
      setStep(2);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoadingStep(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpVerify = async () => {
    if (!otp || otp.length !== 6) {
      setMessage('❌ Please enter the complete 6-digit OTP code');
      return;
    }

    try {
      setLoadingStep(true);
      setMessage('🔐 Verifying OTP...');

      // Verify OTP
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Invalid OTP code');
      }

      setMessage('🎉 Login successful! Redirecting to dashboard...');
      console.log('User logged in successfully');
      
      // ✅ Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoadingStep(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoadingStep(true);
      setMessage('📧 Resending OTP...');

      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'login',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('📩 OTP resent to your email.');
        setOtp('');
      } else {
        setMessage(`❌ ${result.error || 'Failed to resend OTP'}`);
      }
    } catch (err: any) {
      setMessage(`❌ Failed to resend OTP. Please try again.`);
    } finally {
      setLoadingStep(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Secure Login</h2>

      {message && (
        <div className={`mb-3 p-3 text-sm rounded ${
          message.includes('✅') || message.includes('🎉') 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : message.includes('❌') 
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {message}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loadingStep}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loadingStep}
          />

          <button
            onClick={handlePasswordCheck}
            disabled={loadingStep || !email || !password}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loadingStep ? "Checking..." : "Next"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 text-center">
              ✅ Password verified. Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
          </div>

          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
            }}
            disabled={loadingStep}
            maxLength={6}
          />

          <button
            onClick={handleOtpVerify}
            disabled={loadingStep || otp.length !== 6}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loadingStep ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => setStep(1)}
              disabled={loadingStep}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleResendOTP}
              disabled={loadingStep}
              className="flex-1 py-2 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Resend
            </button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Didn't receive the code? Check your spam folder.</p>
          </div>
        </div>
      )}
    </div>
  );
}
