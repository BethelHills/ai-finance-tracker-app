'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield } from 'lucide-react';

export function OTPLoginExample() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
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
        setMessage('OTP sent successfully! Check your email.');
        setStep('otp');

        // In development, show the OTP for testing
        if (result.otp) {
          console.log(`🔑 Development OTP for ${email}: ${result.otp}`);
          setMessage(`OTP sent! (Dev mode: ${result.otp})`);
        }
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      if (result.success) {
        setMessage(
          '✅ OTP verified successfully! You can now proceed with login.'
        );
        // Here you would typically redirect to dashboard or complete login
        setTimeout(() => {
          setStep('email');
          setEmail('');
          setOtp('');
          setMessage(null);
        }, 2000);
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await handleSendOTP();
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
    setError(null);
    setMessage(null);
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold text-center flex items-center justify-center gap-2'>
          <Shield className='h-6 w-6' />
          OTP Login Demo
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {step === 'email' ? (
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
                  onChange={e => setEmail(e.target.value)}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={loading}
              className='w-full'
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='otp'>Enter 6-digit OTP</Label>
              <Input
                id='otp'
                type='text'
                placeholder='123456'
                value={otp}
                onChange={e =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className='text-center text-2xl tracking-widest'
                maxLength={6}
                required
              />
              <p className='text-sm text-gray-500 text-center'>
                OTP sent to: <strong>{email}</strong>
              </p>
            </div>

            <div className='space-y-2'>
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className='w-full'
              >
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <Button
                variant='outline'
                onClick={handleResendOTP}
                disabled={loading}
                className='w-full'
              >
                Resend OTP
              </Button>

              <Button variant='ghost' onClick={handleBack} className='w-full'>
                Back to Email
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
