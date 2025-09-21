'use client';

import { EnhancedDashboard } from '@/components/enhanced-dashboard';
import { EnhancedFinancialDashboard } from '@/components/enhanced-financial-dashboard';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { TransactionsPage } from '@/components/transactions-page';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { SearchFilter } from '@/components/search-filter';
import { MonthlyReport } from '@/components/monthly-report';
import { ThemeToggle } from '@/components/theme-toggle';
import { AccountLinking } from '@/components/account-linking';
import { TransactionReconciliation } from '@/components/transactions/transaction-reconciliation';
import { AuditLogViewer } from '@/components/admin/audit-log-viewer';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
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

// Force dynamic rendering to avoid static generation issues with useSession
export const dynamic = 'force-dynamic';

function MainApp() {
  const { isSimulationMode } = useSimulation();

  if (!isSimulationMode) {
    return <SimulationLandingPage />;
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Desktop Header */}
      <div className='hidden lg:block'>
        <Header />
      </div>

      <div className='flex'>
        {/* Desktop Sidebar */}
        <div className='hidden lg:block'>
          <Sidebar />
        </div>

        <main className='flex-1 p-4 lg:p-6'>
          <div className='max-w-7xl mx-auto space-y-6'>
            {/* Mobile Theme Toggle */}
            <div className='lg:hidden flex justify-end mb-4'>
              <ThemeToggle />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue='dashboard' className='space-y-6'>
              <TabsList className='grid w-full grid-cols-2 lg:grid-cols-10'>
                <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
                <TabsTrigger value='transactions'>Transactions</TabsTrigger>
                <TabsTrigger value='reconciliation'>Reconciliation</TabsTrigger>
                <TabsTrigger value='ai-insights'>AI Insights</TabsTrigger>
                <TabsTrigger value='payments'>Payments</TabsTrigger>
                <TabsTrigger value='ledger'>Ledger</TabsTrigger>
                <TabsTrigger value='compliance'>Compliance</TabsTrigger>
                <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                <TabsTrigger value='reports'>Reports</TabsTrigger>
                <TabsTrigger value='admin'>Admin</TabsTrigger>
              </TabsList>

              <TabsContent value='dashboard' className='space-y-6'>
                <SimulationDashboard />
              </TabsContent>

              <TabsContent value='transactions' className='space-y-6'>
                <TransactionsPage />
              </TabsContent>

              <TabsContent value='reconciliation' className='space-y-6'>
                <TransactionReconciliation />
              </TabsContent>

              <TabsContent value='ai-insights' className='space-y-6'>
                <AIInsightsDashboard />
              </TabsContent>

              <TabsContent value='payments' className='space-y-6'>
                <NigerianPaymentFlow />
              </TabsContent>

              <TabsContent value='ledger' className='space-y-6'>
                <TransactionLedger />
              </TabsContent>

              <TabsContent value='compliance' className='space-y-6'>
                <KYCCompliance />
              </TabsContent>

              <TabsContent value='analytics' className='space-y-6'>
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value='reports' className='space-y-6'>
                <MonthlyReport />
              </TabsContent>

              <TabsContent value='admin' className='space-y-6'>
                <AuditLogViewer />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return <MainApp />;
}