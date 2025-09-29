'use client';

import React, { useState } from 'react';
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
import { Eye, EyeOff, Loader2, Mail, Lock, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';

interface SecureLoginFlowProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SecureLoginFlow({ onSuccess, redirectTo }: SecureLoginFlowProps) {
  const { signIn, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loadingStep, setLoadingStep] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

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
      setMessage('🎉 Login successful!');
      
      // Call the success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
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
          email: email,
          type: 'login',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ New OTP sent to your email.');
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
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <div className='mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4'>
          <Shield className='h-8 w-8 text-white' />
        </div>
        <CardTitle className='text-2xl font-bold'>
          Secure Login
        </CardTitle>
        <CardDescription>
          {step === 1 
            ? 'Enter your credentials to continue'
            : 'Enter the verification code sent to your email'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className='space-y-4'>
        {message && (
          <Alert className={message.includes('✅') || message.includes('🎉') ? 'border-green-200 bg-green-50' : message.includes('❌') ? 'border-red-200 bg-red-50' : ''}>
            <AlertDescription className='text-sm'>{message}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Email + Password */}
        {step === 1 && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='pl-10'
                  disabled={loadingStep}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='pl-10 pr-10'
                  disabled={loadingStep}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handlePasswordCheck}
              disabled={loadingStep || !email || !password}
              className='w-full'
            >
              {loadingStep ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                'Verify Credentials'
              )}
            </Button>

            <div className='text-center text-sm'>
              Don't have an account?{' '}
              <Link
                href='/auth/signup'
                className='text-blue-600 hover:text-blue-800 underline'
              >
                Sign up
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className='space-y-4'>
            <div className='text-center p-4 bg-green-50 border border-green-200 rounded-lg'>
              <CheckCircle className='h-8 w-8 text-green-600 mx-auto mb-2' />
              <p className='text-sm text-green-700 font-medium'>
                Password Verified Successfully
              </p>
              <p className='text-xs text-green-600 mt-1'>
                We've sent a 6-digit code to {email}
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='otp'>Verification Code</Label>
              <Input
                id='otp'
                type='text'
                placeholder='Enter 6-digit code'
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  if (value.length === 6) {
                    // Auto-submit when 6 digits are entered
                    setTimeout(() => handleOtpVerify(), 100);
                  }
                }}
                className='text-center text-lg font-mono tracking-widest'
                disabled={loadingStep}
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleOtpVerify}
              disabled={loadingStep || otp.length !== 6}
              className='w-full'
            >
              {loadingStep ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>

            <div className='flex space-x-2'>
              <Button
                variant='outline'
                onClick={handleBackToPassword}
                className='flex-1'
                disabled={loadingStep}
              >
                Back
              </Button>
              <Button
                variant='outline'
                onClick={handleResendOTP}
                className='flex-1'
                disabled={loadingStep}
              >
                {loadingStep ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Resend Code
              </Button>
            </div>

            <div className='text-center text-xs text-gray-500'>
              <p>Didn't receive the code? Check your spam folder or</p>
              <p>contact support if you continue to have issues.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
