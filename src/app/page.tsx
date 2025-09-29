'use client';

import { useState } from 'react';
import { EnhancedDashboard } from '@/components/enhanced-dashboard';
import { EnhancedFinancialDashboard } from '@/components/enhanced-financial-dashboard';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { TransactionsPage } from '@/components/transactions-page';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { SearchFilter } from '@/components/search-filter';
import { MonthlyReport } from '@/components/monthly-report';
import { BudgetOverview } from '@/components/budget-overview';
import { ThemeToggle } from '@/components/theme-toggle';
import { AccountLinking } from '@/components/account-linking';
import { TransactionReconciliation } from '@/components/transactions/transaction-reconciliation';
import { AuditLogViewer } from '@/components/admin/audit-log-viewer';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { RecurringPaymentReminder } from '@/components/reminders/recurring-payment-reminder';
import { EnhancedReportsDashboard } from '@/components/reports/enhanced-reports-dashboard';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { UserProfile } from '@/components/auth/user-profile';
import { AIInsightsDashboard } from '@/components/ai/ai-insights-dashboard';
import { PlaidLinkFlow } from '@/components/plaid/plaid-link-flow';
import { NigerianPaymentFlow } from '@/components/payments/nigerian-payment-flow';
import { BusinessRegistration } from '@/components/compliance/business-registration';
import { TransactionLedger } from '@/components/ledger/transaction-ledger';
import { KYCCompliance } from '@/components/compliance/kyc-compliance';
import { SimulationDashboard } from '@/components/simulation/simulation-dashboard';
import { SimulationLandingPage } from '@/components/simulation/landing-page';
import { useSimulation } from '@/lib/simulation/simulation-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Force dynamic rendering to avoid static generation issues with useSession
export const dynamic = 'force-dynamic';

function MainApp() {
  const { isSimulationMode } = useSimulation();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isSimulationMode) {
    return <SimulationLandingPage />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        {/* Desktop Header */}
        <div className='hidden lg:block'>
          <Header activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className='flex'>
          {/* Desktop Sidebar */}
          <div className='hidden lg:block'>
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          <main className='flex-1 p-4 lg:p-6'>
            <div className='max-w-7xl mx-auto space-y-6'>
              {/* Mobile Theme Toggle */}
              <div className='lg:hidden flex justify-end mb-4'>
                <ThemeToggle />
              </div>

              {/* Main Content Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='space-y-6'
              >
                <TabsList className='grid w-full grid-cols-2 lg:grid-cols-14'>
                  <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
                  <TabsTrigger value='transactions'>Transactions</TabsTrigger>
                  <TabsTrigger value='ai-insights'>AI Insights</TabsTrigger>
                  <TabsTrigger value='budgets'>Budgets</TabsTrigger>
                  <TabsTrigger value='goals'>Goals</TabsTrigger>
                  <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                  <TabsTrigger value='reports'>Reports</TabsTrigger>
                  <TabsTrigger value='reminders'>Reminders</TabsTrigger>
                  <TabsTrigger value='profile'>Profile</TabsTrigger>
                  <TabsTrigger value='admin'>Admin</TabsTrigger>
                </TabsList>

                <TabsContent value='dashboard' className='space-y-6'>
                  <SimulationDashboard />
                </TabsContent>

                <TabsContent value='transactions' className='space-y-6'>
                  <TransactionsPage />
                </TabsContent>

                <TabsContent value='ai-insights' className='space-y-6'>
                  <AIInsightsDashboard />
                </TabsContent>

                <TabsContent value='budgets' className='space-y-6'>
                  <BudgetOverview utilization={75} />
                </TabsContent>

                <TabsContent value='goals' className='space-y-6'>
                  <div className='text-center py-12'>
                    <h2 className='text-2xl font-bold mb-4'>Financial Goals</h2>
                    <p className='text-muted-foreground mb-6'>
                      Set and track your financial goals
                    </p>
                    <Button>Create New Goal</Button>
                  </div>
                </TabsContent>

                <TabsContent value='analytics' className='space-y-6'>
                  <AnalyticsDashboard />
                </TabsContent>

                <TabsContent value='reports' className='space-y-6'>
                  <EnhancedReportsDashboard />
                </TabsContent>

                <TabsContent value='reminders' className='space-y-6'>
                  <RecurringPaymentReminder />
                </TabsContent>

                <TabsContent value='profile' className='space-y-6'>
                  <UserProfile />
                </TabsContent>

                <TabsContent value='admin' className='space-y-6'>
                  <AdminDashboard />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Home() {
  return <MainApp />;
}
