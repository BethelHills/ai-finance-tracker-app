'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Building2, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';

interface PlaidAccount {
  account_id: string;
  name: string;
  type: string;
  balances: {
    current: number | null;
    available: number | null;
  };
  mask?: string;
}

interface StripeAccount {
  id: string;
  email: string;
  country: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

interface NigerianBank {
  id: number;
  name: string;
  code: string;
}

export function AccountLinking() {
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null);
  const [nigerianBanks, setNigerianBanks] = useState<NigerianBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Load existing accounts
  useEffect(() => {
    loadAccounts();
    loadNigerianBanks();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      
      // Load Plaid accounts
      const plaidResponse = await fetch('/api/plaid/accounts');
      if (plaidResponse.ok) {
        const { accounts } = await plaidResponse.json();
        setPlaidAccounts(accounts);
      }

      // Load Stripe account
      const stripeResponse = await fetch('/api/stripe/account');
      if (stripeResponse.ok) {
        const { account } = await stripeResponse.json();
        setStripeAccount(account);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNigerianBanks = async () => {
    try {
      const response = await fetch('/api/nigerian-payments/banks');
      if (response.ok) {
        const { banks } = await response.json();
        setNigerianBanks(banks);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const handlePlaidLink = async () => {
    try {
      setLoading(true);
      
      // Get link token
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get link token');
      }
      
      const { link_token } = await response.json();
      setLinkToken(link_token);
      
      // Open Plaid Link (you would integrate with Plaid Link component here)
      toast.success('Plaid Link is ready to connect your bank accounts.');
      
    } catch (error) {
      console.error('Error initiating Plaid link:', error);
      toast.error('Failed to initiate Plaid link');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com', // Get from user session
          country: 'US',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create Stripe account');
      }
      
      const { account_link_url } = await response.json();
      
      // Redirect to Stripe Connect
      window.open(account_link_url, '_blank');
      
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      toast.error('Failed to create Stripe account');
    } finally {
      setLoading(false);
    }
  };

  const syncTransactions = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/plaid/transactions');
      if (response.ok) {
        const { transactions } = await response.json();
        toast.success(`Synced ${transactions.length} transactions`);
        loadAccounts(); // Refresh accounts
      }
    } catch (error) {
      console.error('Error syncing transactions:', error);
      toast.error('Failed to sync transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Account Linking</h2>
          <p className="text-muted-foreground">
            Connect your bank accounts and payment providers for seamless financial management
          </p>
        </div>
        <Button onClick={syncTransactions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Sync Transactions
        </Button>
      </div>

      <Tabs defaultValue="banking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="banking">Banking</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="nigerian">Nigerian</TabsTrigger>
        </TabsList>

        <TabsContent value="banking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bank Accounts (Plaid)
              </CardTitle>
              <CardDescription>
                Connect your bank accounts to automatically import transactions and balances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plaidAccounts.length > 0 ? (
                <div className="space-y-2">
                  {plaidAccounts.map((account) => (
                    <div
                      key={account.account_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.type} ••••{account.mask}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${account.balances.current?.toFixed(2) || '0.00'}
                        </p>
                        <Badge variant="secondary">Connected</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No bank accounts connected yet
                  </p>
                  <Button onClick={handlePlaidLink} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Bank Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Processing (Stripe)
              </CardTitle>
              <CardDescription>
                Set up payment processing for global transactions and payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripeAccount ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{stripeAccount.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {stripeAccount.country.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant={stripeAccount.charges_enabled ? "default" : "secondary"}
                      >
                        {stripeAccount.charges_enabled ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        Charges
                      </Badge>
                      <Badge 
                        variant={stripeAccount.payouts_enabled ? "default" : "secondary"}
                      >
                        {stripeAccount.payouts_enabled ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        Payouts
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No payment account set up yet
                  </p>
                  <Button onClick={handleStripeConnect} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Set Up Payments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nigerian" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Nigerian Payments
              </CardTitle>
              <CardDescription>
                Manage Nigerian bank transfers with Paystack and Flutterwave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Paystack</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bank transfers and payments
                  </p>
                  <Button size="sm" className="w-full">
                    Configure Paystack
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Flutterwave</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Virtual accounts and transfers
                  </p>
                  <Button size="sm" className="w-full">
                    Configure Flutterwave
                  </Button>
                </div>
              </div>
              
              {nigerianBanks.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Available Banks ({nigerianBanks.length})</h3>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {nigerianBanks.slice(0, 10).map((bank) => (
                      <div key={bank.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">{bank.name}</span>
                        <span className="text-xs text-muted-foreground">{bank.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
