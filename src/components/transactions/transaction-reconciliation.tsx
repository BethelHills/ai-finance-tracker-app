'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: Date;
  status: 'pending' | 'settled' | 'failed' | 'disputed';
  type: 'income' | 'expense' | 'transfer';
  account: string;
  reference: string;
  bankReference?: string;
  reconciliationStatus: 'unreconciled' | 'reconciled' | 'disputed';
  category?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReconciliationStats {
  totalTransactions: number;
  reconciled: number;
  unreconciled: number;
  disputed: number;
  pending: number;
  totalAmount: number;
  reconciledAmount: number;
}

export function TransactionReconciliation() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [stats, setStats] = useState<ReconciliationStats>({
    totalTransactions: 0,
    reconciled: 0,
    unreconciled: 0,
    disputed: 0,
    pending: 0,
    totalAmount: 0,
    reconciledAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reconciliationFilter, setReconciliationFilter] =
    useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterAndSortTransactions();
  }, [
    transactions,
    searchTerm,
    statusFilter,
    reconciliationFilter,
    sortBy,
    sortOrder,
  ]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions/reconciliation');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        tx =>
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.bankReference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Reconciliation filter
    if (reconciliationFilter !== 'all') {
      filtered = filtered.filter(
        tx => tx.reconciliationStatus === reconciliationFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleReconcile = async (transactionId: string) => {
    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/reconcile`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast.success('Transaction reconciled successfully');
        loadTransactions();
      }
    } catch (error) {
      toast.error('Failed to reconcile transaction');
    }
  };

  const handleDispute = async (transactionId: string) => {
    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/dispute`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast.success('Transaction marked as disputed');
        loadTransactions();
      }
    } catch (error) {
      toast.error('Failed to dispute transaction');
    }
  };

  const exportTransactions = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(
        `/api/transactions/export?format=${format}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions: filteredTransactions,
            filters: { statusFilter, reconciliationFilter, searchTerm },
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-reconciliation.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Transactions exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'settled':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'failed':
        return <XCircle className='h-4 w-4 text-red-600' />;
      case 'disputed':
        return <AlertTriangle className='h-4 w-4 text-orange-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      settled: 'default',
      pending: 'secondary',
      failed: 'destructive',
      disputed: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getReconciliationBadge = (status: string) => {
    const variants = {
      reconciled: 'default',
      unreconciled: 'secondary',
      disputed: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Transaction Reconciliation</h2>
          <p className='text-muted-foreground'>
            Review and reconcile your transactions with bank records
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button onClick={() => exportTransactions('csv')} variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export CSV
          </Button>
          <Button onClick={() => exportTransactions('pdf')} variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export PDF
          </Button>
          <Button onClick={loadTransactions}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalTransactions}</div>
            <p className='text-xs text-muted-foreground'>
              ${stats.totalAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Reconciled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats.reconciled}
            </div>
            <p className='text-xs text-muted-foreground'>
              ${stats.reconciledAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Unreconciled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.unreconciled}
            </div>
            <p className='text-xs text-muted-foreground'>Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Disputed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {stats.disputed}
            </div>
            <p className='text-xs text-muted-foreground'>Requires review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search transactions...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='settled'>Settled</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
                <SelectItem value='disputed'>Disputed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={reconciliationFilter}
              onValueChange={setReconciliationFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder='Reconciliation' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Reconciliation</SelectItem>
                <SelectItem value='reconciled'>Reconciled</SelectItem>
                <SelectItem value='unreconciled'>Unreconciled</SelectItem>
                <SelectItem value='disputed'>Disputed</SelectItem>
              </SelectContent>
            </Select>

            <div className='flex space-x-2'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='date'>Date</SelectItem>
                  <SelectItem value='amount'>Amount</SelectItem>
                  <SelectItem value='description'>Description</SelectItem>
                  <SelectItem value='status'>Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                size='icon'
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                <ArrowUpDown className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredTransactions.map(transaction => (
              <div
                key={transaction.id}
                className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
              >
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center space-x-2'>
                    {getStatusIcon(transaction.status)}
                    <span className='font-medium'>
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <p className='font-medium'>{transaction.description}</p>
                    <p className='text-sm text-muted-foreground'>
                      {new Date(transaction.date).toLocaleDateString()} •{' '}
                      {transaction.account}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Ref: {transaction.reference}
                      {transaction.bankReference &&
                        ` • Bank: ${transaction.bankReference}`}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='text-right'>
                    <div className='flex items-center space-x-2'>
                      {getStatusBadge(transaction.status)}
                      {getReconciliationBadge(transaction.reconciliationStatus)}
                    </div>
                    {transaction.category && (
                      <p className='text-xs text-muted-foreground mt-1'>
                        {transaction.category}
                      </p>
                    )}
                  </div>

                  <div className='flex space-x-2'>
                    {transaction.reconciliationStatus === 'unreconciled' && (
                      <Button
                        size='sm'
                        onClick={() => handleReconcile(transaction.id)}
                      >
                        <CheckCircle className='h-4 w-4 mr-1' />
                        Reconcile
                      </Button>
                    )}

                    {transaction.reconciliationStatus === 'reconciled' && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDispute(transaction.id)}
                      >
                        <AlertTriangle className='h-4 w-4 mr-1' />
                        Dispute
                      </Button>
                    )}

                    <Button size='sm' variant='outline'>
                      <Eye className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className='text-center py-8'>
                <p className='text-muted-foreground'>No transactions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
