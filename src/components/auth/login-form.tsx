'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Mail,
  LogIn,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginState {
  step: 1 | 2; // Step 1: Login form, Step 2: OTP verification
  loading: boolean;
  message: string | null;
  messageType: 'success' | 'error' | 'info';
  formData: LoginFormData;
  otp: string;
  resendCooldown: number;
  showPassword: boolean;
}

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/' }: LoginFormProps) {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({
    step: 1,
    loading: false,
    message: null,
    messageType: 'info',
    formData: {
      email: '',
      password: '',
    },
    otp: '',
    resendCooldown: 0,
    showPassword: false,
  });

  const updateState = (updates: Partial<LoginState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateFormData = (updates: Partial<LoginFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  };

  const showMessage = (message: string, type: 'success' | 'error' | 'info') => {
    updateState({ message, messageType: type });
  };

  const validateForm = (): string | null => {
    const { email, password } = state.formData;

    if (!email.trim()) return 'Email is required';
    if (!email.includes('@')) return 'Please enter a valid email';
    if (!password.trim()) return 'Password is required';

    return null;
  };

  const handleLogin = async () => {
    const validationError = validateForm();
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    updateState({ loading: true, message: null });

    try {
      console.log('🚀 Sending OTP for login:', state.formData.email);

      // Send OTP via your fast Resend API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.formData.email,
          type: 'login',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send verification code');
      }

      showMessage('✅ Verification code sent to your email.', 'success');
      updateState({ step: 2 });
    } catch (error: any) {
      console.error('Login error:', error);
      showMessage(
        `❌ ${error.message || 'Login failed. Please try again.'}`,
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

      showMessage('🎉 Login successful! Redirecting...', 'success');

      // Call onSuccess callback if provided, otherwise redirect
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
      }
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
          type: 'login',
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

  const handleBackToLogin = () => {
    updateState({ step: 1, message: null, otp: '' });
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <div className='flex justify-center mb-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center'>
            <LogIn className='w-6 h-6 text-white' />
          </div>
        </div>
        <CardTitle className='text-xl font-bold'>
          {state.step === 1 ? 'Sign In' : 'Verify Email'}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
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
              <div className='relative mt-1'>
                <Input
                  id='password'
                  type={state.showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={state.formData.password}
                  onChange={e => updateFormData({ password: e.target.value })}
                  className='pr-10'
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() =>
                    updateState({ showPassword: !state.showPassword })
                  }
                >
                  {state.showPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={state.loading}
              className='w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            >
              {state.loading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Sending Code...
                </>
              ) : (
                <>
                  <LogIn className='w-4 h-4 mr-2' />
                  Send Verification Code
                </>
              )}
            </Button>
          </div>
        )}

        {state.step === 2 && (
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Mail className='w-5 h-5 text-blue-600' />
              </div>
              <p className='text-sm text-gray-600'>
                We sent a verification code to:
              </p>
              <p className='font-semibold text-gray-900 text-sm'>
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

            <div className='flex space-x-2'>
              <Button
                onClick={handleOTPVerify}
                disabled={state.loading || !state.otp.trim()}
                className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              >
                {state.loading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Verify & Sign In
                  </>
                )}
              </Button>

              <Button onClick={handleBackToLogin} variant='outline' size='icon'>
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
            Don't have an account?{' '}
            <a
              href='/auth/signup'
              className='text-blue-600 hover:text-blue-700 font-semibold'
            >
              Sign up
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
