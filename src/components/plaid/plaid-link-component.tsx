'use client';

import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlaidLinkComponentProps {
  linkToken: string | null;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: (error: any, metadata: any) => void;
  institutionName?: string;
  disabled?: boolean;
}

export function PlaidLinkComponent({
  linkToken,
  onSuccess,
  onExit,
  institutionName,
  disabled = false
}: PlaidLinkComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const config = {
    token: linkToken,
    onSuccess: (publicToken: string, metadata: any) => {
      console.log('Plaid Link Success:', { publicToken, metadata });
      setIsLoading(true);
      
      // Call the success handler
      onSuccess(publicToken, metadata);
      
      toast({
        title: 'Account Linked Successfully',
        description: `Connected ${metadata.institution?.name || 'bank account'}`,
      });
    },
    onExit: (error: any, metadata: any) => {
      console.log('Plaid Link Exit:', { error, metadata });
      
      if (error) {
        toast({
          title: 'Link Failed',
          description: error.error_message || 'Failed to link account',
          variant: 'destructive',
        });
      }
      
      if (onExit) {
        onExit(error, metadata);
      }
    },
    onEvent: (eventName: string, metadata: any) => {
      console.log('Plaid Link Event:', eventName, metadata);
      
      switch (eventName) {
        case 'OPEN':
          toast({
            title: 'Opening Plaid Link',
            description: 'Please complete the authentication process',
          });
          break;
        case 'EXIT':
          if (metadata.error) {
            toast({
              title: 'Authentication Failed',
              description: metadata.error.error_message,
              variant: 'destructive',
            });
          }
          break;
        case 'HANDOFF':
          toast({
            title: 'Redirecting to Bank',
            description: 'You will be redirected to your bank\'s website',
          });
          break;
      }
    },
  };

  const { open, ready, error } = usePlaidLink(config);

  const handleClick = () => {
    if (ready && !disabled) {
      open();
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Error: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Connect Bank Account</span>
        </CardTitle>
        <CardDescription>
          {institutionName 
            ? `Connect your ${institutionName} account securely`
            : 'Securely connect your bank account to sync transactions'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant={ready ? 'default' : 'secondary'}>
                {ready ? 'Ready' : 'Loading...'}
              </Badge>
              {linkToken && (
                <Badge variant="outline">
                  Token: {linkToken.substring(0, 8)}...
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={handleClick}
            disabled={!ready || disabled || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4 mr-2" />
                {institutionName ? `Connect to ${institutionName}` : 'Connect Bank Account'}
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            <p>Your bank credentials are never stored. We use bank-level security.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for managing Plaid Link state
export function usePlaidLinkManager() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLinkToken = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const data = await response.json();
      setLinkToken(data.link_token);
      return data.link_token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const exchangePublicToken = async (publicToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token: publicToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange public token');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLinkToken = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, refresh: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh link token');
      }

      const data = await response.json();
      setLinkToken(data.link_token);
      return data.link_token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    linkToken,
    isLoading,
    error,
    createLinkToken,
    exchangePublicToken,
    refreshLinkToken,
    setLinkToken,
    setError,
  };
}

// Example usage component
export function PlaidLinkExample() {
  const { 
    linkToken, 
    isLoading, 
    error, 
    createLinkToken, 
    exchangePublicToken 
  } = usePlaidLinkManager();
  const { toast } = useToast();

  useEffect(() => {
    // Create link token when component mounts
    createLinkToken('user_123').catch(console.error);
  }, []);

  const handleSuccess = async (publicToken: string, metadata: any) => {
    try {
      const result = await exchangePublicToken(publicToken);
      console.log('Exchange successful:', result);
      
      toast({
        title: 'Account Connected',
        description: 'Your bank account has been successfully linked',
      });
    } catch (error) {
      console.error('Exchange failed:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to complete account linking',
        variant: 'destructive',
      });
    }
  };

  const handleExit = (error: any, metadata: any) => {
    console.log('Plaid Link exited:', { error, metadata });
  };

  return (
    <div className="max-w-md mx-auto">
      <PlaidLinkComponent
        linkToken={linkToken}
        onSuccess={handleSuccess}
        onExit={handleExit}
        disabled={isLoading}
      />
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
