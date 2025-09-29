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
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { OTPVerification } from './otp-verification';
import { otpService } from '@/lib/otp-service';

interface SignupFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SignupForm({ onSuccess, redirectTo }: SignupFormProps) {
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    console.log('🔄 Form submitted, validating...');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form valid, sending OTP...');
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
          type: 'signup',
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

      // OTP verified, now create the account
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
      });

      if (error) {
        console.error('💥 Signup error:', error);
        return {
          success: false,
          error: error.message || 'Failed to create account. Please try again.',
        };
      } else {
        console.log('🎉 Signup successful:', data);
        setSuccess(true);
        // Auto-redirect after a short delay
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
        return { success: true };
      }
    } catch (err) {
      console.error('💥 Signup exception:', err);
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
          type: 'signup',
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
        type='signup'
      />
    );
  }

  if (success) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center text-green-600'>
            Account Created Successfully!
          </CardTitle>
          <CardDescription className='text-center'>
            Welcome to AI Finance Tracker, {formData.fullName}!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Your account has been created and you're now signed in. You can
              start managing your finances right away.
            </AlertDescription>
          </Alert>
          <div className='text-center mt-4'>
            <Link
              href='/dashboard'
              className='text-blue-600 hover:text-blue-800 underline'
            >
              Go to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>
          Create account
        </CardTitle>
        <CardDescription className='text-center'>
          Sign up to start managing your finances
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
            <Label htmlFor='fullName'>Full Name</Label>
            <div className='relative'>
              <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                id='fullName'
                name='fullName'
                type='text'
                placeholder='Enter your full name'
                value={formData.fullName}
                onChange={handleInputChange}
                className='pl-10'
                required
              />
            </div>
          </div>

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
                placeholder='Create a password'
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
            <p className='text-xs text-gray-500'>
              Must be at least 6 characters
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm your password'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className='pl-10 pr-10'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                {showConfirmPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
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
                  : 'Creating account...'}
              </>
            ) : (
              'Create account'
            )}
          </Button>

          {loading && (
            <div className='text-center text-sm text-gray-600'>
              <p>Setting up your secure account...</p>
              <p className='text-xs mt-1'>This may take a moment</p>
            </div>
          )}

          <div className='text-center text-sm'>
            Already have an account?{' '}
            <Link
              href='/auth/login'
              className='text-blue-600 hover:text-blue-800 underline'
            >
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
