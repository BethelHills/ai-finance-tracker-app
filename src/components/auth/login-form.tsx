'use client';

import { useState } from 'react';
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
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { OTPVerification } from './otp-verification';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSendingOTP(true);

    try {
      // Send OTP via API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          type: 'login',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowOTP(true);
      } else {
        setError(result.error || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('💥 OTP sending failed:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      // Verify OTP via API
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // OTP verified, now sign in
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        return { success: false, error: error.message };
      } else {
        onSuccess?.();
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  };

  const handleOTPResend = async () => {
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          type: 'login',
        }),
      });

      const result = await response.json();
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to resend code' };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  if (showOTP) {
    return (
      <OTPVerification
        email={formData.email}
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        onBack={() => setShowOTP(false)}
        type='login'
      />
    );
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>
          Welcome back
        </CardTitle>
        <CardDescription className='text-center'>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={handleInputChange}
                className='pl-10'
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleInputChange}
                className='pl-10 pr-10'
                required
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

          <div className='flex items-center justify-between'>
            <Link
              href='/auth/forgot-password'
              className='text-sm text-blue-600 hover:text-blue-800 underline'
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={loading || isSendingOTP}
          >
            {loading || isSendingOTP ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {isSendingOTP
                  ? 'Sending verification code...'
                  : 'Signing in...'}
              </>
            ) : (
              'Sign in'
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
        </form>
      </CardContent>
    </Card>
  );
}
