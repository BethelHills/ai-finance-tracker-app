'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Copy, CheckCircle } from 'lucide-react';

export default function OTPFallbackPage() {
  const [email, setEmail] = useState('bettybella777@gmail.com');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sendOTP = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage(null);
    setOtp(null);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), type: 'signup' }),
      });

      const result = await response.json();

      if (response.ok) {
        setOtp(result.otp);
        setMessage('✅ OTP generated successfully! Use the code below:');
      } else {
        setMessage(`❌ Failed to generate OTP: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyOTP = async () => {
    if (otp) {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">OTP Fallback Solution</CardTitle>
          <p className="text-gray-600 mt-2">
            Get your OTP code directly when emails don't arrive
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert className={`${
              message.includes('✅') ? 'border-green-200 bg-green-50' :
              message.includes('❌') ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <AlertDescription className={`${
                message.includes('✅') ? 'text-green-800' :
                message.includes('❌') ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            onClick={sendOTP}
            disabled={loading || !email.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating OTP...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Get OTP Code
              </>
            )}
          </Button>

          {otp && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🎯 Your OTP Code:</h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white border border-green-300 rounded px-3 py-2 font-mono text-lg text-center">
                  {otp}
                </div>
                <Button
                  onClick={copyOTP}
                  size="sm"
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-green-700 mt-2">
                ⏰ This code expires in 5 minutes
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 How to Use:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Enter your email address</li>
              <li>2. Click "Get OTP Code"</li>
              <li>3. Copy the 6-digit code</li>
              <li>4. Use it in the signup/login form</li>
            </ol>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Having email issues? This is your backup solution! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
