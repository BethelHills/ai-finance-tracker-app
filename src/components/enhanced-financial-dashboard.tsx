'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Building2,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinancialHealth {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  debtToIncomeRatio: number;
}

interface AccountBalance {
  accountId: string;
  accountName: string;
  currentBalance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  lastUpdated: Date;
}

interface QueueStats {
  transactionSync: any;
  reconciliation: any;
  webhookProcessing: any;
  aiCategorization: any;
}

export function EnhancedFinancialDashboard() {
  const [financialHealth, setFinancialHealth] = useState<FinancialHealth | null>(null);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load financial health metrics
      const healthResponse = await fetch('/api/secure/financial-health');
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        setFinancialHealth(health);
      }

      // Load account balances
      const balancesResponse = await fetch('/api/secure/account-balances');
      if (balancesResponse.ok) {
        const balances = await balancesResponse.json();
        setAccountBalances(balances);
      }

      // Load queue statistics
      const queueResponse = await fetch('/api/admin/queue-stats');
      if (queueResponse.ok) {
        const stats = await queueResponse.json();
        setQueueStats(stats);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerReconciliation = async () => {
    try {
      const response = await fetch('/api/secure/reconcile-accounts', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Account reconciliation started',
        });
        loadDashboardData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start reconciliation',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading enhanced dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Financial Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive financial management with real-time data and AI insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={triggerReconciliation} size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Reconcile
          </Button>
        </div>
      </div>

      {/* Financial Health Overview */}
      {financialHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financialHealth.netWorth.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Assets: ${financialHealth.totalAssets.toLocaleString()} | 
                Liabilities: ${financialHealth.totalLiabilities.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(financialHealth.savingsRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly: ${financialHealth.monthlyIncome.toLocaleString()} | 
                Expenses: ${financialHealth.monthlyExpenses.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debt-to-Income</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(financialHealth.debtToIncomeRatio * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {financialHealth.debtToIncomeRatio < 0.3 ? 'Healthy' : 'High'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Secure</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Account Balances
          </CardTitle>
          <CardDescription>
            Real-time account balances with pending transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accountBalances.map((account) => (
              <div key={account.accountId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{account.accountName}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.currency} • Last updated: {new Date(account.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${account.currentBalance.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Available: ${account.availableBalance.toLocaleString()}</span>
                    {account.pendingBalance > 0 && (
                      <Badge variant="secondary">
                        Pending: ${account.pendingBalance.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Tabs defaultValue="queues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queues">Background Jobs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="ai">AI Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="queues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Background Job Status</CardTitle>
              <CardDescription>
                Real-time status of background processing queues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queueStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {queueStats.transactionSync?.waiting || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Transaction Sync</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {queueStats.reconciliation?.waiting || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Reconciliation</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {queueStats.webhookProcessing?.waiting || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Webhooks</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {queueStats.aiCategorization?.waiting || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">AI Categorization</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Data Encryption</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit Logging</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fraud Detection</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compliance Checks</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Processing Status</CardTitle>
              <CardDescription>
                AI-powered features and processing statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Transaction Categorization</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fraud Detection</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Financial Insights</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Predictive Analytics</span>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Processing
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
