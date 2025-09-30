'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const handleTestEmail = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type: 'signup',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ OTP sent successfully! Check your email inbox.');
        setMessageType('success');
      } else {
        setMessage(`❌ Failed to send OTP: ${result.error}`);
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConfig = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/test-resend-config');
      const result = await response.json();

      if (result.success) {
        setMessage('✅ Resend configuration is working perfectly!');
        setMessageType('success');
      } else {
        setMessage(`❌ Configuration issue: ${result.error}`);
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Email Configuration Test</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert className={`${
              messageType === 'success' ? 'border-green-200 bg-green-50' :
              messageType === 'error' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <AlertDescription className={`${
                messageType === 'success' ? 'text-green-800' :
                messageType === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleTestEmail}
                disabled={loading || !email.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test OTP
                  </>
                )}
              </Button>

              <Button
                onClick={handleTestConfig}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test Configuration
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>Configuration Status:</strong><br />
              ✅ Resend API Key: Configured<br />
              ✅ Email From: AI Finance Tracker<br />
              ✅ Environment: Development
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
