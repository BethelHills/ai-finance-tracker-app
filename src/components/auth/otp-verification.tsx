'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Loader2, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<{ success: boolean; error?: string }>;
  onResend: () => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  type: 'signup' | 'login';
}

export function OTPVerification({
  email,
  onVerify,
  onResend,
  onBack,
  type,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError(null);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await onVerify(otpString);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      const result = await onResend();
      if (result.success) {
        setTimeLeft(300); // Reset timer
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <Mail className='h-8 w-8 text-green-600' />
          </div>
          <CardTitle className='text-2xl font-bold text-green-600'>
            Email Verified!
          </CardTitle>
          <CardDescription>
            Your email has been successfully verified. You can now access your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center'>
            <Button asChild className='w-full'>
              <Link href='/dashboard'>Continue to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
          <Mail className='h-8 w-8 text-blue-600' />
        </div>
        <CardTitle className='text-2xl font-bold'>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit verification code to
          <br />
          <span className='font-medium text-blue-600'>{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='space-y-4'>
          <div className='flex justify-center space-x-2'>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={el => {
                  inputRefs.current[index] = el;
                }}
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className='w-12 h-12 text-center text-lg font-bold border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                disabled={isVerifying}
              />
            ))}
          </div>

          <div className='text-center text-sm text-muted-foreground'>
            {timeLeft > 0 ? (
              <span>Code expires in {formatTime(timeLeft)}</span>
            ) : (
              <span className='text-red-500'>Code has expired</span>
            )}
          </div>
        </div>

        <div className='space-y-3'>
          <Button
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length !== 6}
            className='w-full'
          >
            {isVerifying ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className='flex space-x-2'>
            <Button variant='outline' onClick={onBack} className='flex-1'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Button>
            <Button
              variant='outline'
              onClick={handleResend}
              disabled={isResending || timeLeft > 0}
              className='flex-1'
            >
              {isResending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Resend
                </>
              )}
            </Button>
          </div>
        </div>

        <div className='text-center text-xs text-muted-foreground'>
          <p>
            Didn't receive the code? Check your spam folder or{' '}
            <button
              onClick={handleResend}
              disabled={isResending || timeLeft > 0}
              className='text-blue-600 hover:text-blue-800 underline disabled:opacity-50'
            >
              resend
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
