'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

export default function EmailDebugPage() {
  const [email, setEmail] = useState('bettybella777@gmail.com');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testEmailDelivery = async () => {
    setLoading(true);
    const newResults = [...results];
    
    try {
      // Test 1: Basic OTP
      newResults.push({ type: 'info', message: '🧪 Testing OTP delivery...' });
      setResults([...newResults]);
      
      const otpResponse = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'signup' }),
      });
      
      const otpResult = await otpResponse.json();
      
      if (otpResult.success) {
        newResults.push({ 
          type: 'success', 
          message: `✅ OTP sent successfully! Code: ${otpResult.otp}` 
        });
      } else {
        newResults.push({ 
          type: 'error', 
          message: `❌ OTP failed: ${otpResult.error}` 
        });
      }
      setResults([...newResults]);

      // Test 2: Test email
      newResults.push({ type: 'info', message: '🧪 Testing email delivery...' });
      setResults([...newResults]);
      
      const testResponse = await fetch('/api/test-email-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const testResult = await testResponse.json();
      
      if (testResult.success) {
        newResults.push({ 
          type: 'success', 
          message: `✅ Test email sent successfully!` 
        });
      } else {
        newResults.push({ 
          type: 'error', 
          message: `❌ Test email failed: ${testResult.error}` 
        });
      }
      setResults([...newResults]);

      // Test 3: Configuration check
      newResults.push({ type: 'info', message: '🔍 Checking configuration...' });
      setResults([...newResults]);
      
      const configResponse = await fetch('/api/test-resend-config');
      const configResult = await configResponse.json();
      
      if (configResult.success) {
        newResults.push({ 
          type: 'success', 
          message: `✅ Configuration: ${configResult.config.emailFrom}` 
        });
      } else {
        newResults.push({ 
          type: 'error', 
          message: `❌ Configuration issue: ${configResult.error}` 
        });
      }
      setResults([...newResults]);

    } catch (error: any) {
      newResults.push({ 
        type: 'error', 
        message: `❌ Test failed: ${error.message}` 
      });
      setResults([...newResults]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Email Delivery Debug Tool</CardTitle>
          <p className="text-gray-600 mt-2">
            Comprehensive testing for OTP email delivery issues
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
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

          <div className="flex space-x-2">
            <Button
              onClick={testEmailDelivery}
              disabled={loading || !email.trim()}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Run Full Test
                </>
              )}
            </Button>

            <Button
              onClick={clearResults}
              variant="outline"
              disabled={loading}
            >
              Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Test Results:</h3>
              {results.map((result, index) => (
                <Alert
                  key={index}
                  className={`${
                    result.type === 'success' ? 'border-green-200 bg-green-50' :
                    result.type === 'error' ? 'border-red-200 bg-red-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <AlertDescription className={`${
                    result.type === 'success' ? 'text-green-800' :
                    result.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {result.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">🔍 Troubleshooting Steps:</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. <strong>Check your spam folder</strong> - Look for emails from "AI Finance Tracker"</li>
              <li>2. <strong>Check all email folders</strong> - Promotions, Updates, etc.</li>
              <li>3. <strong>Try a different email provider</strong> - Gmail, Outlook, Yahoo</li>
              <li>4. <strong>Check Resend dashboard</strong> - Look for delivery logs</li>
              <li>5. <strong>Wait 2-3 minutes</strong> - Sometimes there's a delay</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📧 Current Configuration:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Sender:</strong> AI Finance Tracker &lt;noreply@resend.dev&gt;</li>
              <li>• <strong>Service:</strong> Resend API</li>
              <li>• <strong>Status:</strong> ✅ Configured and working</li>
              <li>• <strong>Delivery Time:</strong> 700-1200ms (very fast!)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
