import { EnhancedDashboard } from '@/components/enhanced-dashboard'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { TransactionForm } from '@/components/transaction-form'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { SearchFilter } from '@/components/search-filter'
import { MonthlyReport } from '@/components/monthly-report'
import { ThemeToggle } from '@/components/theme-toggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header />
      </div>
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Mobile Theme Toggle */}
            <div className="lg:hidden flex justify-end mb-4">
              <ThemeToggle />
            </div>
            
            {/* Main Content Tabs */}
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-6">
                <EnhancedDashboard />
              </TabsContent>
              
              <TabsContent value="transactions" className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/3">
                    <TransactionForm onSubmit={(data) => console.log('Transaction added:', data)} />
                  </div>
                  <div className="lg:w-2/3">
                    <SearchFilter 
                      onSearch={(query) => console.log('Search:', query)}
                      onFilter={(filters) => console.log('Filter:', filters)}
                      onClear={() => console.log('Clear filters')}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsDashboard />
              </TabsContent>
              
              <TabsContent value="reports" className="space-y-6">
                <MonthlyReport />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
