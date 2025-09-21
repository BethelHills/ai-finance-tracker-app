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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Force dynamic rendering to avoid static generation issues with useSession
export const dynamic = 'force-dynamic';

export default function Home() {
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
              <TabsList className='grid w-full grid-cols-2 lg:grid-cols-5'>
                <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
                <TabsTrigger value='transactions'>Transactions</TabsTrigger>
                <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                <TabsTrigger value='reports'>Reports</TabsTrigger>
                <TabsTrigger value='accounts'>Accounts</TabsTrigger>
              </TabsList>

              <TabsContent value='dashboard' className='space-y-6'>
                <EnhancedFinancialDashboard />
              </TabsContent>

              <TabsContent value='transactions' className='space-y-6'>
                <TransactionsPage />
              </TabsContent>

              <TabsContent value='analytics' className='space-y-6'>
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value='reports' className='space-y-6'>
                <MonthlyReport />
              </TabsContent>

              <TabsContent value='accounts' className='space-y-6'>
                <AccountLinking />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
