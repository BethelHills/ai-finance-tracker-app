'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { otpService } from '@/lib/otp-service';

interface OTPDevHelperProps {
  email: string;
}

export function OTPDevHelper({ email }: OTPDevHelperProps) {
  const [otp, setOtp] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkOTP = () => {
      const storedOTP = otpService.getStoredOTP(email);
      setOtp(storedOTP);
    };

    checkOTP();
    const interval = setInterval(checkOTP, 1000);

    return () => clearInterval(interval);
  }, [email]);

  const copyToClipboard = async () => {
    if (otp) {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!otp) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>Development Helper</span>
          <Badge variant="secondary" className="text-xs">DEV</Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          OTP code for testing (only visible in development)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <div className="text-lg font-mono font-bold">
              {isVisible ? otp : '••••••'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Click to copy
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsVisible(!isVisible)}
              className="h-8 w-8 p-0"
            >
              {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0"
              disabled={!isVisible}
            >
              {copied ? (
                <RefreshCw className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        {copied && (
          <div className="text-xs text-green-600 mt-1">
            Copied to clipboard!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
