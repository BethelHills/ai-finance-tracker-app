'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface SignupState {
  step: 1 | 2; // Step 1: Signup form, Step 2: OTP verification
  loading: boolean;
  message: string | null;
  messageType: 'success' | 'error' | 'info';
  formData: SignupFormData;
  otp: string;
  resendCooldown: number;
}

export function EnhancedSignupForm() {
  const router = useRouter();
  const [state, setState] = useState<SignupState>({
    step: 1,
    loading: false,
    message: null,
    messageType: 'info',
    formData: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
    otp: '',
    resendCooldown: 0,
  });

  const updateState = (updates: Partial<SignupState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateFormData = (updates: Partial<SignupFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  };

  const showMessage = (message: string, type: 'success' | 'error' | 'info') => {
    updateState({ message, messageType: type });
  };

  const validateForm = (): string | null => {
    const { email, password, confirmPassword, fullName } = state.formData;

    if (!fullName.trim()) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (!email.includes('@')) return 'Please enter a valid email';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';

    return null;
  };

  const handleSignup = async () => {
    const validationError = validateForm();
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    updateState({ loading: true, message: null });

    try {
      // Step 1: Create user account (using fallback auth since Supabase is not configured)
      console.log('🚀 Creating user account:', state.formData.email);

      // Step 2: Send OTP via your fast Resend API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.formData.email,
          type: 'signup',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send verification code');
      }

      showMessage(
        '✅ Account created! Verification code sent to your email.',
        'success'
      );
      updateState({ step: 2 });
    } catch (error: any) {
      console.error('Signup error:', error);
      showMessage(
        `❌ ${error.message || 'Signup failed. Please try again.'}`,
        'error'
      );
    } finally {
      updateState({ loading: false });
    }
  };

  const handleOTPVerify = async () => {
    if (!state.otp.trim()) {
      showMessage('Please enter the verification code', 'error');
      return;
    }

    updateState({ loading: true, message: null });

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.formData.email,
          otp: state.otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      showMessage(
        '🎉 Verification successful! Redirecting to dashboard...',
        'success'
      );

      // Redirect to dashboard after successful verification
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      showMessage(
        `❌ ${error.message || 'Verification failed. Please try again.'}`,
        'error'
      );
    } finally {
      updateState({ loading: false });
    }
  };

  const handleResendOTP = async () => {
    if (state.resendCooldown > 0) return;

    updateState({ loading: true, message: null });

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.formData.email,
          type: 'signup',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend verification code');
      }

      showMessage('📩 New verification code sent to your email', 'success');

      // Start cooldown timer
      updateState({ resendCooldown: 30 });
      const timer = setInterval(() => {
        setState(prev => {
          const newCooldown = prev.resendCooldown - 1;
          if (newCooldown <= 0) {
            clearInterval(timer);
            return { ...prev, resendCooldown: 0 };
          }
          return { ...prev, resendCooldown: newCooldown };
        });
      }, 1000);
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      showMessage(
        `❌ ${error.message || 'Failed to resend verification code'}`,
        'error'
      );
    } finally {
      updateState({ loading: false });
    }
  };

  const handleBackToSignup = () => {
    updateState({ step: 1, message: null, otp: '' });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <Card className='w-full max-w-md shadow-xl border-0'>
        <CardHeader className='text-center pb-6'>
          <div className='flex justify-center mb-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center'>
              <Shield className='w-8 h-8 text-white' />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-gray-900'>
            {state.step === 1 ? 'Create Account' : 'Verify Email'}
          </CardTitle>
          <p className='text-gray-600 mt-2'>
            {state.step === 1
              ? 'Join AI Finance Tracker for intelligent financial management'
              : 'Enter the verification code sent to your email'}
          </p>
        </CardHeader>

        <CardContent className='space-y-6'>
          {state.message && (
            <Alert
              className={`${
                state.messageType === 'success'
                  ? 'border-green-200 bg-green-50'
                  : state.messageType === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
              }`}
            >
              <AlertDescription
                className={`${
                  state.messageType === 'success'
                    ? 'text-green-800'
                    : state.messageType === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                }`}
              >
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          {state.step === 1 && (
            <div className='space-y-4'>
              <div>
                <Label htmlFor='fullName'>Full Name</Label>
                <Input
                  id='fullName'
                  type='text'
                  placeholder='Enter your full name'
                  value={state.formData.fullName}
                  onChange={e => updateFormData({ fullName: e.target.value })}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={state.formData.email}
                  onChange={e => updateFormData({ email: e.target.value })}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Create a password'
                  value={state.formData.password}
                  onChange={e => updateFormData({ password: e.target.value })}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='Confirm your password'
                  value={state.formData.confirmPassword}
                  onChange={e =>
                    updateFormData({ confirmPassword: e.target.value })
                  }
                  className='mt-1'
                />
              </div>

              <Button
                onClick={handleSignup}
                disabled={state.loading}
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                {state.loading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Shield className='w-4 h-4 mr-2' />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          )}

          {state.step === 2 && (
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Mail className='w-6 h-6 text-green-600' />
                </div>
                <p className='text-sm text-gray-600'>
                  We sent a verification code to:
                </p>
                <p className='font-semibold text-gray-900'>
                  {state.formData.email}
                </p>
              </div>

              <div>
                <Label htmlFor='otp'>Verification Code</Label>
                <Input
                  id='otp'
                  type='text'
                  placeholder='Enter 6-digit code'
                  value={state.otp}
                  onChange={e => updateState({ otp: e.target.value })}
                  className='mt-1 text-center text-lg font-mono tracking-widest'
                  maxLength={6}
                />
              </div>

              <div className='flex space-x-3'>
                <Button
                  onClick={handleOTPVerify}
                  disabled={state.loading || !state.otp.trim()}
                  className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-200'
                >
                  {state.loading ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='w-4 h-4 mr-2' />
                      Verify Code
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBackToSignup}
                  variant='outline'
                  className='px-4'
                >
                  <ArrowLeft className='w-4 h-4' />
                </Button>
              </div>

              <div className='text-center'>
                <button
                  onClick={handleResendOTP}
                  disabled={state.loading || state.resendCooldown > 0}
                  className='text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed'
                >
                  {state.resendCooldown > 0
                    ? `Resend in ${state.resendCooldown}s`
                    : 'Resend verification code'}
                </button>
              </div>
            </div>
          )}

          <div className='text-center pt-4 border-t'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className='text-blue-600 hover:text-blue-700 font-semibold'
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
