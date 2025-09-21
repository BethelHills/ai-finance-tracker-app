'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  User,
  CreditCard,
  History,
  Plus,
  Eye,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransferRecipient {
  id: string;
  paystackRecipientId: string;
  name: string;
  email: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  description: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
}

interface Transfer {
  id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  recipient: {
    name: string;
    accountNumber: string;
    bankName: string;
  };
  reason: string;
  createdAt: Date;
  processedAt?: Date;
}

interface Bank {
  id: number;
  name: string;
  code: string;
}

export function PaystackTransferFlow() {
  const [recipients, setRecipients] = useState<TransferRecipient[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('transfer');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipientsRes, transfersRes, banksRes, accountsRes] = await Promise.all([
        fetch('/api/paystack/recipients'),
        fetch('/api/paystack/transfers'),
        fetch('/api/paystack/banks'),
        fetch('/api/accounts')
      ]);

      if (recipientsRes.ok) {
        const recipientsData = await recipientsRes.json();
        setRecipients(recipientsData.data.local || []);
      }

      if (transfersRes.ok) {
        const transfersData = await transfersRes.json();
        setTransfers(transfersData.data.local || []);
      }

      if (banksRes.ok) {
        const banksData = await banksRes.json();
        setBanks(banksData.data || []);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.data || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Paystack Transfer Flow</h2>
        <p className="text-muted-foreground">
          Complete transfer flow: Create recipient → Initiate transfer → Webhook handling
        </p>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transfer">Make Transfer</TabsTrigger>
          <TabsTrigger value="recipients">Manage Recipients</TabsTrigger>
          <TabsTrigger value="transfers">Transfer History</TabsTrigger>
          <TabsTrigger value="verify">Verify Transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="space-y-6">
          <TransferForm
            recipients={recipients}
            accounts={accounts}
            onTransferSuccess={() => {
              loadData();
              setActiveTab('transfers');
            }}
          />
        </TabsContent>

        <TabsContent value="recipients" className="space-y-6">
          <RecipientsManager
            recipients={recipients}
            banks={banks}
            onRecipientChange={loadData}
          />
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <TransfersHistory
            transfers={transfers}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          <TransferVerification
            onVerifySuccess={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransferForm({
  recipients,
  accounts,
  onTransferSuccess,
}: {
  recipients: TransferRecipient[];
  accounts: any[];
  onTransferSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    recipientId: '',
    accountId: '',
    amount: '',
    reason: '',
    reference: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientId || !formData.accountId || !formData.amount || !formData.reason) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/paystack/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: formData.recipientId,
          accountId: formData.accountId,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          reference: formData.reference || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Transfer initiated: ${data.data.paystack.reference}`,
        });
        
        // Reset form
        setFormData({
          recipientId: '',
          accountId: '',
          amount: '',
          reason: '',
          reference: '',
        });
        
        onTransferSuccess();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to initiate transfer',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate transfer',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowRight className="h-5 w-5" />
          <span>Initiate Transfer</span>
        </CardTitle>
        <CardDescription>
          Send money to a saved recipient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Recipient</label>
              <Select value={formData.recipientId} onValueChange={(value) => setFormData({ ...formData, recipientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.paystackRecipientId}>
                      {recipient.name} - {recipient.accountNumber} ({recipient.bankName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">From Account</label>
              <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - {account.currency} {account.balance.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Amount (NGN)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Reference (Optional)</label>
              <Input
                placeholder="TRF_123456"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Reason</label>
            <Input
              placeholder="Payment for services"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Initiating Transfer...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Initiate Transfer
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RecipientsManager({
  recipients,
  banks,
  onRecipientChange,
}: {
  recipients: TransferRecipient[];
  banks: Bank[];
  onRecipientChange: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accountNumber: '',
    bankCode: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.accountNumber || !formData.bankCode) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/paystack/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Recipient created successfully',
        });
        
        setFormData({
          name: '',
          email: '',
          accountNumber: '',
          bankCode: '',
          description: '',
        });
        setShowAddForm(false);
        onRecipientChange();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create recipient',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create recipient',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Transfer Recipients</span>
            </span>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleAddRecipient} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Account Number</label>
                  <Input
                    placeholder="1234567890"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bank</label>
                  <Select value={formData.bankCode} onValueChange={(value) => setFormData({ ...formData, bankCode: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  placeholder="Business partner"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Recipient'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {recipients.map((recipient) => (
              <div key={recipient.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium">{recipient.name}</h4>
                    <p className="text-sm text-gray-600">
                      {recipient.accountNumber} • {recipient.bankName}
                    </p>
                    {recipient.description && (
                      <p className="text-xs text-gray-500">{recipient.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={recipient.isActive ? 'default' : 'secondary'}>
                    {recipient.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {recipient.lastUsedAt && (
                    <span className="text-xs text-gray-500">
                      Last used: {new Date(recipient.lastUsedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {recipients.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recipients found</p>
                <p className="text-sm text-gray-400">Add a recipient to start making transfers</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TransfersHistory({
  transfers,
  onRefresh,
}: {
  transfers: Transfer[];
  onRefresh: () => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'reversed':
        return <Badge className="bg-gray-100 text-gray-800">Reversed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Transfer History</span>
          </span>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {getStatusIcon(transfer.status)}
                <div>
                  <h4 className="font-medium">Transfer to {transfer.recipient.name}</h4>
                  <p className="text-sm text-gray-600">
                    {transfer.recipient.accountNumber} • {transfer.recipient.bankName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ref: {transfer.reference} • {transfer.reason}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-medium">
                    ₦{transfer.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(transfer.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {getStatusBadge(transfer.status)}
              </div>
            </div>
          ))}

          {transfers.length === 0 && (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transfers found</p>
              <p className="text-sm text-gray-400">Make your first transfer to see it here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TransferVerification({
  onVerifySuccess,
}: {
  onVerifySuccess: () => void;
}) {
  const [reference, setReference] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reference) {
      toast({
        title: 'Error',
        description: 'Please enter a transfer reference',
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/paystack/transfers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
        toast({
          title: 'Success',
          description: 'Transfer verification completed',
        });
        onVerifySuccess();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to verify transfer',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify transfer',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Verify Transfer</span>
        </CardTitle>
        <CardDescription>
          Check the status of a transfer using its reference
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Transfer Reference</label>
            <Input
              placeholder="TRF_123456789"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={verifying} className="w-full">
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Verify Transfer
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Verification Result</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
                  {result.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>₦{result.paystack.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span>{result.paystack.reference}</span>
              </div>
              <div className="flex justify-between">
                <span>Verified:</span>
                <span>{result.verified ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
