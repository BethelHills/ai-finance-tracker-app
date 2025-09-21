'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  RefreshCw, 
  Download, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LedgerEntry {
  id: string;
  timestamp: Date;
  accountId: string;
  accountName: string;
  transactionId: string;
  amount: number;
  balance: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  metadata: Record<string, any>;
}

interface AccountBalance {
  accountId: string;
  accountName: string;
  currentBalance: number;
  currency: string;
  lastUpdated: Date;
}

interface ReconciliationReport {
  id: string;
  accountId: string;
  accountName: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'completed' | 'failed';
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  discrepancies: number;
  balanceDifference: number;
  createdAt: Date;
  completedAt?: Date;
}

export function TransactionLedger() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [reconciliationReports, setReconciliationReports] = useState<ReconciliationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadLedgerData();
  }, []);

  const loadLedgerData = async () => {
    try {
      setLoading(true);
      const [ledgerResponse, balancesResponse, reconciliationResponse] = await Promise.all([
        fetch('/api/ledger/entries'),
        fetch('/api/ledger/balances'),
        fetch('/api/ledger/reconciliation-reports')
      ]);

      if (ledgerResponse.ok) {
        const ledgerData = await ledgerResponse.json();
        setLedgerEntries(ledgerData.entries);
      }

      if (balancesResponse.ok) {
        const balancesData = await balancesResponse.json();
        setAccountBalances(balancesData.balances);
      }

      if (reconciliationResponse.ok) {
        const reconciliationData = await reconciliationResponse.json();
        setReconciliationReports(reconciliationData.reports);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load ledger data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = accountFilter === 'all' || entry.accountId === accountFilter;
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;

    return matchesSearch && matchesAccount && matchesType && matchesStatus;
  });

  const exportLedger = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/ledger/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entries: filteredEntries,
          filters: { searchTerm, accountFilter, typeFilter, statusFilter }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ledger-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: `Ledger exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export ledger',
        variant: 'destructive',
      });
    }
  };

  const runReconciliation = async (accountId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/ledger/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Reconciliation started successfully',
        });
        loadLedgerData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start reconciliation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading ledger data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction Ledger</h2>
          <p className="text-muted-foreground">
            Comprehensive financial ledger with reconciliation capabilities
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => exportLedger('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportLedger('pdf')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={loadLedgerData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Account Balances Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accountBalances.map((account) => (
          <Card key={account.accountId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{account.accountName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {account.currency} {account.currentBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {account.lastUpdated.toLocaleDateString()}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => runReconciliation(account.accountId)}
              >
                Reconcile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Ledger Interface */}
      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entries">Ledger Entries</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          <LedgerEntriesTab
            entries={filteredEntries}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            accountFilter={accountFilter}
            setAccountFilter={setAccountFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            accounts={accountBalances}
          />
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-6">
          <ReconciliationTab
            reports={reconciliationReports}
            accounts={accountBalances}
            onRunReconciliation={runReconciliation}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsTab entries={filteredEntries} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab entries={filteredEntries} balances={accountBalances} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LedgerEntriesTab({
  entries,
  searchTerm,
  setSearchTerm,
  accountFilter,
  setAccountFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  accounts,
}: {
  entries: LedgerEntry[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  accountFilter: string;
  setAccountFilter: (filter: string) => void;
  typeFilter: string;
  setTypeFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  accounts: AccountBalance[];
}) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.accountId} value={account.accountId}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DEBIT">Debit</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Ledger Entries ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {entry.type === 'CREDIT' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {entry.type === 'CREDIT' ? '+' : '-'}${Math.abs(entry.amount).toLocaleString()}
                    </span>
                  </div>
                  
                  <div>
                    <p className="font-medium">{entry.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.accountName} • {entry.timestamp.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ref: {entry.reference}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-medium">
                      Balance: ${entry.balance.toLocaleString()}
                    </div>
                    <Badge className={
                      entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                      entry.status === 'failed' ? 'bg-red-100 text-red-800' :
                      entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {entry.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {entries.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No ledger entries found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReconciliationTab({
  reports,
  accounts,
  onRunReconciliation,
  loading,
}: {
  reports: ReconciliationReport[];
  accounts: AccountBalance[];
  onRunReconciliation: (accountId: string) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Reconciliation Reports</span>
          </CardTitle>
          <CardDescription>
            Monitor and manage account reconciliation processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{report.accountName}</h4>
                  <Badge className={
                    report.status === 'completed' ? 'bg-green-100 text-green-800' :
                    report.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {report.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Transactions:</span>
                    <div className="font-medium">{report.totalTransactions}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Matched:</span>
                    <div className="font-medium text-green-600">{report.matchedTransactions}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Unmatched:</span>
                    <div className="font-medium text-red-600">{report.unmatchedTransactions}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Discrepancies:</span>
                    <div className="font-medium text-orange-600">{report.discrepancies}</div>
                  </div>
                </div>
                {report.balanceDifference !== 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <span className="text-red-800 font-medium">
                      Balance Difference: ${report.balanceDifference.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reconciliation reports found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run Reconciliation</CardTitle>
          <CardDescription>
            Start reconciliation for specific accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div key={account.accountId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{account.accountName}</h4>
                    <p className="text-sm text-gray-600">
                      Balance: {account.currency} {account.currentBalance.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => onRunReconciliation(account.accountId)}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Reconcile'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsTab({ entries }: { entries: LedgerEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Ledger Reports</span>
        </CardTitle>
        <CardDescription>
          Generate comprehensive financial reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Report generation features coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsTab({ 
  entries, 
  balances 
}: { 
  entries: LedgerEntry[];
  balances: AccountBalance[];
}) {
  const totalDebits = entries
    .filter(entry => entry.type === 'DEBIT')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalCredits = entries
    .filter(entry => entry.type === 'CREDIT')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const netAmount = totalCredits - totalDebits;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalDebits.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalCredits.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              netAmount >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${netAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Ledger Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Advanced analytics coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
