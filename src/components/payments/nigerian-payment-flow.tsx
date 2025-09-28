'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Building2,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
  Upload,
  Banknote,
  Shield,
  Users,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Bank {
  id: number;
  name: string;
  code: string;
  country: string;
}

interface TransferRecipient {
  id: number;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  recipientEmail?: string;
  recipientPhone?: string;
  reference: string;
}

interface TransferRequest {
  amount: number;
  recipientId: number;
  reason: string;
  reference: string;
}

export function NigerianPaymentFlow() {
  const [activeTab, setActiveTab] = useState('receive');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [recipients, setRecipients] = useState<TransferRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    'paystack' | 'flutterwave'
  >('paystack');
  const { toast } = useToast();

  useEffect(() => {
    loadBanks();
    loadRecipients();
  }, [selectedProvider]);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/nigerian-payments/banks?provider=${selectedProvider}`
      );
      if (response.ok) {
        const data = await response.json();
        setBanks(data.banks);
      }
    } catch (error) {
      toast.error('Failed to load banks');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const response = await fetch('/api/nigerian-payments/recipients');
      if (response.ok) {
        const data = await response.json();
        setRecipients(data.recipients);
      }
    } catch (error) {
      console.error('Failed to load recipients:', error);
    }
  };

  const handlePaymentRequest = async (request: PaymentRequest) => {
    try {
      setLoading(true);
      const response = await fetch('/api/nigerian-payments/request-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, provider: selectedProvider }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Payment link generated: ${data.paymentLink}`);
      }
    } catch (error) {
      toast.error('Failed to create payment request');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (request: TransferRequest) => {
    try {
      setLoading(true);
      const response = await fetch('/api/nigerian-payments/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, provider: selectedProvider }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Transfer reference: ${data.reference}`);
      }
    } catch (error) {
      toast.error('Failed to initiate transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h2 className='text-3xl font-bold'>Nigerian Payment Services</h2>
        <p className='text-muted-foreground'>
          Send and receive payments in NGN using Paystack and Flutterwave
        </p>
      </div>

      {/* Provider Selection */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Payment Provider</CardTitle>
          <CardDescription>
            Choose your preferred payment provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProvider === 'paystack'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedProvider('paystack')}
            >
              <div className='flex items-center space-x-3'>
                <div className='h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center'>
                  <CreditCard className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <h4 className='font-medium'>Paystack</h4>
                  <p className='text-sm text-gray-600'>
                    Nigeria's leading payment processor
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProvider === 'flutterwave'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedProvider('flutterwave')}
            >
              <div className='flex items-center space-x-3'>
                <div className='h-10 w-10 bg-green-100 rounded-full flex items-center justify-center'>
                  <Banknote className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <h4 className='font-medium'>Flutterwave</h4>
                  <p className='text-sm text-gray-600'>
                    Pan-African payment platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Payment Interface */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='receive'>Receive Payments</TabsTrigger>
          <TabsTrigger value='send'>Send Money</TabsTrigger>
          <TabsTrigger value='recipients'>Manage Recipients</TabsTrigger>
          <TabsTrigger value='history'>Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value='receive' className='space-y-6'>
          <ReceivePaymentTab
            provider={selectedProvider}
            onPaymentRequest={handlePaymentRequest}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value='send' className='space-y-6'>
          <SendMoneyTab
            provider={selectedProvider}
            banks={banks}
            recipients={recipients}
            onTransfer={handleTransfer}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value='recipients' className='space-y-6'>
          <ManageRecipientsTab
            banks={banks}
            recipients={recipients}
            onRefresh={loadRecipients}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value='history' className='space-y-6'>
          <TransactionHistoryTab provider={selectedProvider} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReceivePaymentTab({
  provider,
  onPaymentRequest,
  loading,
}: {
  provider: string;
  onPaymentRequest: (request: PaymentRequest) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    recipientEmail: '',
    recipientPhone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    onPaymentRequest({
      amount,
      currency: 'NGN',
      description: formData.description,
      recipientEmail: formData.recipientEmail || undefined,
      recipientPhone: formData.recipientPhone || undefined,
      reference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Upload className='h-5 w-5' />
          <span>Request Payment</span>
        </CardTitle>
        <CardDescription>
          Generate payment links to receive money from customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>Amount (NGN)</label>
              <Input
                type='number'
                placeholder='0.00'
                value={formData.amount}
                onChange={e =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className='text-sm font-medium'>Description</label>
              <Input
                placeholder='Payment for services'
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>
                Customer Email (Optional)
              </label>
              <Input
                type='email'
                placeholder='customer@example.com'
                value={formData.recipientEmail}
                onChange={e =>
                  setFormData({ ...formData, recipientEmail: e.target.value })
                }
              />
            </div>
            <div>
              <label className='text-sm font-medium'>
                Customer Phone (Optional)
              </label>
              <Input
                type='tel'
                placeholder='+234 800 000 0000'
                value={formData.recipientPhone}
                onChange={e =>
                  setFormData({ ...formData, recipientPhone: e.target.value })
                }
              />
            </div>
          </div>

          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Creating Payment Link...
              </>
            ) : (
              <>
                <CreditCard className='h-4 w-4 mr-2' />
                Generate Payment Link
              </>
            )}
          </Button>
        </form>

        <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
          <div className='flex items-start space-x-2'>
            <Shield className='h-5 w-5 text-blue-600 mt-0.5' />
            <div>
              <h4 className='font-medium text-blue-900'>
                Secure Payment Processing
              </h4>
              <p className='text-sm text-blue-800 mt-1'>
                All payments are processed securely through{' '}
                {provider === 'paystack' ? 'Paystack' : 'Flutterwave'}
                with bank-level encryption and fraud protection.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SendMoneyTab({
  provider,
  banks,
  recipients,
  onTransfer,
  loading,
}: {
  provider: string;
  banks: Bank[];
  recipients: TransferRecipient[];
  onTransfer: (request: TransferRequest) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    recipientId: '',
    bankCode: '',
    accountNumber: '',
    accountName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (formData.recipientId) {
      // Use existing recipient
      onTransfer({
        amount,
        recipientId: parseInt(formData.recipientId),
        reason: formData.reason,
        reference: `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    } else {
      // Create new recipient and transfer
      // This would be handled by the API
      onTransfer({
        amount,
        recipientId: 0, // Will be created
        reason: formData.reason,
        reference: `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Download className='h-5 w-5' />
            <span>Send Money</span>
          </CardTitle>
          <CardDescription>
            Transfer money to Nigerian bank accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium'>Amount (NGN)</label>
                <Input
                  type='number'
                  placeholder='0.00'
                  value={formData.amount}
                  onChange={e =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className='text-sm font-medium'>Reason</label>
                <Input
                  placeholder='Payment for services'
                  value={formData.reason}
                  onChange={e =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className='text-sm font-medium'>Select Recipient</label>
              <Select
                value={formData.recipientId}
                onValueChange={value =>
                  setFormData({ ...formData, recipientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choose existing recipient or add new' />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map(recipient => (
                    <SelectItem
                      key={recipient.id}
                      value={recipient.id.toString()}
                    >
                      {recipient.name} - {recipient.accountNumber} (
                      {recipient.bankName})
                    </SelectItem>
                  ))}
                  <SelectItem value=''>Add New Recipient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!formData.recipientId && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium'>Bank</label>
                    <Select
                      value={formData.bankCode}
                      onValueChange={value =>
                        setFormData({ ...formData, bankCode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select bank' />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map(bank => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className='text-sm font-medium'>
                      Account Number
                    </label>
                    <Input
                      placeholder='1234567890'
                      value={formData.accountNumber}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          accountNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium'>Account Name</label>
                  <Input
                    placeholder='John Doe'
                    value={formData.accountName}
                    onChange={e =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <Button type='submit' disabled={loading} className='w-full'>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Processing Transfer...
                </>
              ) : (
                <>
                  <ArrowRight className='h-4 w-4 mr-2' />
                  Send Money
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold text-gray-900'>₦1,000,000</div>
              <div className='text-sm text-gray-600'>Daily Limit</div>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold text-gray-900'>
                ₦10,000,000
              </div>
              <div className='text-sm text-gray-600'>Monthly Limit</div>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold text-gray-900'>₦50,000</div>
              <div className='text-sm text-gray-600'>Single Transfer</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ManageRecipientsTab({
  banks,
  recipients,
  onRefresh,
  loading,
}: {
  banks: Bank[];
  recipients: TransferRecipient[];
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Users className='h-5 w-5' />
          <span>Transfer Recipients</span>
        </CardTitle>
        <CardDescription>Manage your saved transfer recipients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {recipients.map(recipient => (
            <div
              key={recipient.id}
              className='flex items-center justify-between p-4 border rounded-lg'
            >
              <div>
                <h4 className='font-medium'>{recipient.name}</h4>
                <p className='text-sm text-gray-600'>
                  {recipient.accountNumber} • {recipient.bankName}
                </p>
              </div>
              <div className='flex space-x-2'>
                <Button variant='outline' size='sm'>
                  Edit
                </Button>
                <Button variant='outline' size='sm'>
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {recipients.length === 0 && (
            <div className='text-center py-8'>
              <p className='text-gray-500'>No recipients found</p>
              <Button variant='outline' className='mt-2'>
                Add First Recipient
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionHistoryTab({ provider }: { provider: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <FileText className='h-5 w-5' />
          <span>Transaction History</span>
        </CardTitle>
        <CardDescription>
          View your payment and transfer history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='text-center py-8'>
          <p className='text-gray-500'>
            Transaction history will be displayed here
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
