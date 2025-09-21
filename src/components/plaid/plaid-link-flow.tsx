'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  ArrowRight,
  Eye,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlaidInstitution {
  institution_id: string;
  name: string;
  products: string[];
  country_codes: string[];
  url?: string;
  primary_color?: string;
  logo?: string;
}

interface PlaidAccount {
  account_id: string;
  name: string;
  type: string;
  subtype: string;
  mask: string;
  official_name?: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
  };
}

interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category: string[];
  subcategory?: string[];
  account_owner?: string;
  pending: boolean;
  transaction_type: string;
}

export function PlaidLinkFlow() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<PlaidInstitution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<PlaidInstitution | null>(null);
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const { toast } = useToast();

  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Connect your bank account securely' },
    { id: 'institution', title: 'Select Bank', description: 'Choose your financial institution' },
    { id: 'link', title: 'Link Account', description: 'Securely connect your account' },
    { id: 'sync', title: 'Sync Data', description: 'Import transactions and balances' },
    { id: 'complete', title: 'Complete', description: 'Your account is ready' },
  ];

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plaid/institutions');
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load financial institutions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createLinkToken = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setLinkToken(data.link_token);
        setStep(2);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create link token',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionSelect = (institution: PlaidInstitution) => {
    setSelectedInstitution(institution);
    createLinkToken();
  };

  const handlePlaidLinkSuccess = async (publicToken: string) => {
    try {
      setLoading(true);
      setSyncStatus('syncing');

      // Exchange public token for access token
      const exchangeResponse = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken }),
      });

      if (!exchangeResponse.ok) {
        throw new Error('Failed to exchange token');
      }

      // Fetch accounts
      const accountsResponse = await fetch('/api/plaid/accounts');
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData.accounts);
      }

      // Fetch transactions
      const transactionsResponse = await fetch('/api/plaid/transactions');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      }

      setSyncStatus('completed');
      setStep(4);

      toast({
        title: 'Success!',
        description: 'Bank account linked and transactions synced',
      });
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to sync account data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {step + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-4">
          <h2 className="text-2xl font-bold">{steps[step].title}</h2>
          <p className="text-gray-600">{steps[step].description}</p>
        </div>
      </div>

      {/* Step Content */}
      {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <InstitutionSelectionStep
          institutions={institutions}
          loading={loading}
          onInstitutionSelect={handleInstitutionSelect}
          onRefresh={loadInstitutions}
        />
      )}
      {step === 2 && (
        <PlaidLinkStep
          institution={selectedInstitution}
          linkToken={linkToken}
          onSuccess={handlePlaidLinkSuccess}
          loading={loading}
        />
      )}
      {step === 3 && (
        <DataSyncStep
          accounts={accounts}
          transactions={transactions}
          syncStatus={syncStatus}
          loading={loading}
        />
      )}
      {step === 4 && (
        <CompletionStep
          accounts={accounts}
          transactions={transactions}
          onRestart={() => {
            setStep(0);
            setAccounts([]);
            setTransactions([]);
            setSyncStatus('idle');
          }}
        />
      )}
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span>Secure Bank Connection</span>
        </CardTitle>
        <CardDescription>
          Connect your bank account to automatically sync transactions and get AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium">Bank-Level Security</h4>
              <p className="text-sm text-gray-600">256-bit encryption and read-only access</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium">AI-Powered Insights</h4>
              <p className="text-sm text-gray-600">Automatic categorization and spending analysis</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium">Real-Time Sync</h4>
              <p className="text-sm text-gray-600">Automatic transaction updates and balance tracking</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium">No Credential Storage</h4>
              <p className="text-sm text-gray-600">We never store your banking credentials</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Read-Only Access</h4>
              <p className="text-sm text-blue-800 mt-1">
                We can only view your transactions and balances. We cannot move money or make changes to your account.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={onNext} className="w-full">
          Get Started
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

function InstitutionSelectionStep({
  institutions,
  loading,
  onInstitutionSelect,
  onRefresh,
}: {
  institutions: PlaidInstitution[];
  loading: boolean;
  onInstitutionSelect: (institution: PlaidInstitution) => void;
  onRefresh: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Bank</CardTitle>
        <CardDescription>
          Choose your financial institution to connect your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search for your bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="outline" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading institutions...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredInstitutions.map((institution) => (
                <div
                  key={institution.institution_id}
                  onClick={() => onInstitutionSelect(institution)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{institution.name}</h4>
                      <div className="flex space-x-1 mt-1">
                        {institution.products.map((product) => (
                          <Badge key={product} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredInstitutions.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No institutions found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PlaidLinkStep({
  institution,
  linkToken,
  onSuccess,
  loading,
}: {
  institution: PlaidInstitution | null;
  linkToken: string | null;
  linkToken: string | null;
  onSuccess: (publicToken: string) => void;
  loading: boolean;
}) {
  const [plaidLoaded, setPlaidLoaded] = useState(false);

  useEffect(() => {
    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.onload = () => setPlaidLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handlePlaidLink = () => {
    if (!plaidLoaded || !linkToken) return;

    // In a real implementation, you would initialize Plaid Link here
    // For now, we'll simulate the success callback
    setTimeout(() => {
      onSuccess('mock_public_token');
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="h-6 w-6 text-green-600" />
          <span>Secure Connection</span>
        </CardTitle>
        <CardDescription>
          You'll be redirected to {institution?.name} to securely authenticate your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium">{institution?.name}</h3>
          <p className="text-gray-600">Ready to connect your account</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Secure Authentication</h4>
              <p className="text-sm text-green-800 mt-1">
                You'll be redirected to your bank's secure login page. We never see your credentials.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handlePlaidLink}
          disabled={!plaidLoaded || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect to {institution?.name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function DataSyncStep({
  accounts,
  transactions,
  syncStatus,
  loading,
}: {
  accounts: PlaidAccount[];
  transactions: PlaidTransaction[];
  syncStatus: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Syncing Your Data</CardTitle>
        <CardDescription>
          Importing your accounts and transactions securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              syncStatus === 'completed' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {syncStatus === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              )}
            </div>
            <div>
              <h4 className="font-medium">Accounts Imported</h4>
              <p className="text-sm text-gray-600">{accounts.length} accounts found</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              syncStatus === 'completed' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {syncStatus === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              )}
            </div>
            <div>
              <h4 className="font-medium">Transactions Synced</h4>
              <p className="text-sm text-gray-600">{transactions.length} transactions imported</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              syncStatus === 'completed' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {syncStatus === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              )}
            </div>
            <div>
              <h4 className="font-medium">AI Categorization</h4>
              <p className="text-sm text-gray-600">Processing transactions with AI</p>
            </div>
          </div>
        </div>

        {syncStatus === 'error' && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Sync Error</h4>
                <p className="text-sm text-red-800 mt-1">
                  There was an error syncing your data. Please try again.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompletionStep({
  accounts,
  transactions,
  onRestart,
}: {
  accounts: PlaidAccount[];
  transactions: PlaidTransaction[];
  onRestart: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <span>Connection Complete!</span>
        </CardTitle>
        <CardDescription>
          Your bank account has been successfully connected and synced
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{accounts.length}</div>
            <div className="text-sm text-gray-600">Accounts Connected</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
            <div className="text-sm text-gray-600">Transactions Synced</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">AI</div>
            <div className="text-sm text-gray-600">Insights Ready</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Connected Accounts:</h4>
          {accounts.map((account) => (
            <div key={account.account_id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h5 className="font-medium">{account.name}</h5>
                <p className="text-sm text-gray-600">
                  {account.type} •••• {account.mask}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  ${account.balances.current?.toLocaleString() || '0.00'}
                </div>
                <div className="text-sm text-gray-600">Current Balance</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <Button onClick={onRestart} variant="outline" className="flex-1">
            Connect Another Account
          </Button>
          <Button className="flex-1">
            View Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
