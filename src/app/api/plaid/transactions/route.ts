import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TransactionInsightsService } from '@/lib/ai/transaction-insights';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock transaction data - in production, this would come from Plaid API
    const transactions = [
      {
        transaction_id: 'tx_1',
        account_id: 'acc_1',
        amount: -45.67,
        date: '2024-01-20',
        name: 'STARBUCKS COFFEE',
        merchant_name: 'Starbucks',
        category: ['Food and Drink', 'Restaurants'],
        subcategory: ['Coffee Shop'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'place',
      },
      {
        transaction_id: 'tx_2',
        account_id: 'acc_1',
        amount: -1200.0,
        date: '2024-01-19',
        name: 'RENT PAYMENT',
        merchant_name: 'Apartment Complex',
        category: ['Shops', 'Rent'],
        subcategory: ['Rent'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'place',
      },
      {
        transaction_id: 'tx_3',
        account_id: 'acc_1',
        amount: -89.99,
        date: '2024-01-18',
        name: 'AMAZON.COM',
        merchant_name: 'Amazon',
        category: ['Shops', 'General Merchandise'],
        subcategory: ['Online'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'place',
      },
      {
        transaction_id: 'tx_4',
        account_id: 'acc_1',
        amount: 2500.0,
        date: '2024-01-17',
        name: 'SALARY DEPOSIT',
        merchant_name: 'Employer Corp',
        category: ['Transfer', 'Payroll'],
        subcategory: ['Salary'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'special',
      },
      {
        transaction_id: 'tx_5',
        account_id: 'acc_1',
        amount: -75.5,
        date: '2024-01-16',
        name: 'SHELL GAS STATION',
        merchant_name: 'Shell',
        category: ['Transportation', 'Gas Stations'],
        subcategory: ['Gas'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'place',
      },
      {
        transaction_id: 'tx_6',
        account_id: 'acc_1',
        amount: -25.0,
        date: '2024-01-15',
        name: 'NETFLIX SUBSCRIPTION',
        merchant_name: 'Netflix',
        category: ['Shops', 'Digital'],
        subcategory: ['Streaming'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'recurring',
      },
      {
        transaction_id: 'tx_7',
        account_id: 'acc_1',
        amount: -150.0,
        date: '2024-01-14',
        name: 'GROCERY STORE',
        merchant_name: 'Whole Foods',
        category: ['Shops', 'Food and Drink'],
        subcategory: ['Groceries'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'place',
      },
      {
        transaction_id: 'tx_8',
        account_id: 'acc_1',
        amount: -200.0,
        date: '2024-01-13',
        name: 'UTILITY BILL',
        merchant_name: 'Electric Company',
        category: ['Service', 'Utilities'],
        subcategory: ['Electric'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'recurring',
      },
      {
        transaction_id: 'tx_9',
        account_id: 'acc_1',
        amount: -65.0,
        date: '2024-01-12',
        name: 'RESTAURANT DINNER',
        merchant_name: 'Local Restaurant',
        category: ['Food and Drink', 'Restaurants'],
        subcategory: ['Dining'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'place',
      },
      {
        transaction_id: 'tx_10',
        account_id: 'acc_1',
        amount: -30.0,
        date: '2024-01-11',
        name: 'UBER RIDE',
        merchant_name: 'Uber',
        category: ['Transportation', 'Rideshare'],
        subcategory: ['Ride Share'],
        account_owner: 'John Doe',
        pending: false,
        transaction_type: 'place',
      },
    ];

    // Generate AI insights for transactions
    const insights =
      await TransactionInsightsService.categorizeTransactionsBatch(
        transactions.map(tx => ({
          id: tx.transaction_id,
          amount: tx.amount,
          description: tx.name,
          date: new Date(tx.date),
          merchant: tx.merchant_name,
        }))
      );

    // Generate spending analysis
    const spendingAnalysis =
      await TransactionInsightsService.analyzeSpendingPatterns(
        transactions.map(tx => ({
          id: tx.transaction_id,
          amount: tx.amount,
          description: tx.name,
          date: new Date(tx.date),
          category: tx.category[0],
        }))
      );

    // Generate recommendations
    const recommendations =
      await TransactionInsightsService.generateRecommendations(
        spendingAnalysis,
        {
          age: 30,
          income: 5000,
          goals: ['Save for vacation', 'Build emergency fund'],
        }
      );

    return NextResponse.json({
      transactions,
      insights,
      spendingAnalysis,
      recommendations,
      summary: {
        totalTransactions: transactions.length,
        totalSpent: Math.abs(
          transactions
            .filter(tx => tx.amount < 0)
            .reduce((sum, tx) => sum + tx.amount, 0)
        ),
        totalIncome: transactions
          .filter(tx => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0),
        categories: [...new Set(transactions.flatMap(tx => tx.category))],
        lastSync: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json(
      { error: 'Failed to load transactions' },
      { status: 500 }
    );
  }
}
