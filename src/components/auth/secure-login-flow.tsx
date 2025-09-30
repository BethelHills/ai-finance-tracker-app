'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  CheckCircle,
  Shield,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SecureLoginFlowProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SecureLoginFlow({
  onSuccess,
  redirectTo,
}: SecureLoginFlowProps) {
  const { signIn, loading, user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loadingStep, setLoadingStep] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Step 1: Verify Email + Password
  const handlePasswordCheck = async () => {
    if (!email || !password) {
      setMessage('❌ Please fill in all fields');
      return;
    }

    try {
      setLoadingStep(true);
      setMessage('🔐 Verifying your credentials...');

      // First, verify the password with Supabase/fallback auth
      const { data, error } = await signIn(email, password);

      if (error) {
        throw new Error(error.message || 'Invalid email or password');
      }

      // Password is verified, now send OTP
      setMessage('✅ Password verified. Sending OTP to your email...');

      // Send OTP via our API
      const otpResponse = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: 'login',
        }),
      });

      const otpResult = await otpResponse.json();

      if (!otpResult.success) {
        throw new Error(otpResult.error || 'Failed to send OTP');
      }

      setMessage('✅ Password verified. OTP sent to your email.');
      setIsPasswordVerified(true);
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
      setMessage('🔐 Verifying OTP code...');

      // Verify OTP via our API
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Invalid OTP code');
      }

      // OTP verified, now complete the login
      setMessage('🎉 Login successful! Redirecting to dashboard...');

      // ✅ Redirect to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoadingStep(false);
    }
  };

  // 🔄 Resend OTP
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
          email: email,
          type: 'login',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('📩 OTP resent to your email.');
        setOtp(''); // Clear the current OTP input
      } else {
        setMessage(`❌ ${result.error || 'Failed to resend OTP'}`);
      }
    } catch (err: any) {
      setMessage(`❌ Failed to resend OTP. Please try again.`);
    } finally {
      setLoadingStep(false);
    }
  };

  const handleBackToPassword = () => {
    setStep(1);
    setOtp('');
    setMessage('');
    setIsPasswordVerified(false);
  };

  return (
    <div className='max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg border border-gray-100'>
      <div className='text-center mb-6'>
        <div className='mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg'>
          <Shield className='h-8 w-8 text-white' />
        </div>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Secure Login</h2>
        <p className='text-sm text-gray-600'>
          {step === 1
            ? 'Enter your credentials to continue'
            : 'Enter the verification code sent to your email'}
        </p>
      </div>

      <div className='space-y-6'>
        {message && (
          <div
            className={`mb-4 p-3 text-sm rounded-lg ${
              message.includes('✅') || message.includes('🎉')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : message.includes('❌')
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-gray-50 border border-gray-200 text-gray-700'
            }`}
          >
            {message}
          </div>
        )}

        {/* Step 1: Email + Password */}
        {step === 1 && (
          <div className='space-y-4'>
            <input
              type='email'
              placeholder='Email'
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loadingStep}
            />

            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Password'
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12'
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loadingStep}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
              >
                {showPassword ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>

            <button
              onClick={handlePasswordCheck}
              disabled={loadingStep || !email || !password}
              className='w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm'
            >
              {loadingStep ? (
                <div className='flex items-center justify-center'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Checking...
                </div>
              ) : (
                'Next'
              )}
            </button>

            <div className='text-center text-sm text-gray-600'>
              Don't have an account?{' '}
              <Link
                href='/auth/signup'
                className='text-blue-600 hover:text-blue-800 underline font-medium'
              >
                Sign up
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className='space-y-4'>
            <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
              <div className='flex items-center space-x-2 mb-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                <p className='text-sm text-green-700 font-medium'>
                  Password Verified Successfully
                </p>
              </div>
              <p className='text-xs text-green-600'>
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <input
              type='text'
              placeholder='Enter 6-digit OTP'
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-center text-lg font-mono tracking-widest'
              value={otp}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                if (value.length === 6) {
                  // Auto-submit when 6 digits are entered
                  setTimeout(() => handleOtpVerify(), 100);
                }
              }}
              disabled={loadingStep}
              maxLength={6}
            />

            <button
              onClick={handleOtpVerify}
              disabled={loadingStep || otp.length !== 6}
              className='w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm'
            >
              {loadingStep ? (
                <div className='flex items-center justify-center'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className='flex space-x-2'>
              <button
                onClick={handleBackToPassword}
                disabled={loadingStep}
                className='flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200'
              >
                Back
              </button>
              <button
                onClick={handleResendOTP}
                disabled={loadingStep}
                className='flex-1 py-2 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center'
              >
                {loadingStep ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <RefreshCw className='mr-2 h-4 w-4' />
                )}
                Resend OTP
              </button>
            </div>

            <div className='text-center text-xs text-gray-500'>
              <p>Didn't receive the code? Check your spam folder or</p>
              <p>contact support if you continue to have issues.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
