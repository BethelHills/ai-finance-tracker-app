import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock transaction data for reconciliation
    const transactions = [
      {
        id: 'tx_1',
        amount: -150.00,
        description: 'Grocery Store Purchase',
        date: new Date('2024-01-15'),
        status: 'settled',
        type: 'expense',
        account: 'Checking Account',
        reference: 'REF-TXN-20240115-143022-001500-AB12',
        bankReference: 'CHK-20240115-001500-1234-5678',
        reconciliationStatus: 'reconciled',
        category: 'Groceries',
        notes: 'Weekly grocery shopping',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'tx_2',
        amount: 2500.00,
        description: 'Salary Deposit',
        date: new Date('2024-01-16'),
        status: 'settled',
        type: 'income',
        account: 'Checking Account',
        reference: 'REF-SAL-20240116-090000-025000-CD34',
        bankReference: 'CHK-20240116-025000-1234-5678',
        reconciliationStatus: 'reconciled',
        category: 'Salary',
        notes: 'Monthly salary',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: 'tx_3',
        amount: -75.50,
        description: 'Gas Station',
        date: new Date('2024-01-17'),
        status: 'pending',
        type: 'expense',
        account: 'Checking Account',
        reference: 'REF-GAS-20240117-180000-000755-EF56',
        bankReference: 'CHK-20240117-000755-1234-5678',
        reconciliationStatus: 'unreconciled',
        category: 'Transportation',
        notes: 'Fuel for car',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
      },
      {
        id: 'tx_4',
        amount: -1200.00,
        description: 'Rent Payment',
        date: new Date('2024-01-18'),
        status: 'settled',
        type: 'expense',
        account: 'Checking Account',
        reference: 'REF-RNT-20240118-100000-012000-GH78',
        bankReference: 'CHK-20240118-012000-1234-5678',
        reconciliationStatus: 'reconciled',
        category: 'Housing',
        notes: 'Monthly rent',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
      {
        id: 'tx_5',
        amount: -45.00,
        description: 'Restaurant',
        date: new Date('2024-01-19'),
        status: 'failed',
        type: 'expense',
        account: 'Checking Account',
        reference: 'REF-RST-20240119-190000-000450-IJ90',
        bankReference: 'CHK-20240119-000450-1234-5678',
        reconciliationStatus: 'disputed',
        category: 'Dining',
        notes: 'Dinner with friends',
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19'),
      },
    ];

    const stats = {
      totalTransactions: transactions.length,
      reconciled: transactions.filter(tx => tx.reconciliationStatus === 'reconciled').length,
      unreconciled: transactions.filter(tx => tx.reconciliationStatus === 'unreconciled').length,
      disputed: transactions.filter(tx => tx.reconciliationStatus === 'disputed').length,
      pending: transactions.filter(tx => tx.status === 'pending').length,
      totalAmount: transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      reconciledAmount: transactions
        .filter(tx => tx.reconciliationStatus === 'reconciled')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    };

    return NextResponse.json({ transactions, stats });
  } catch (error) {
    console.error('Reconciliation data error:', error);
    return NextResponse.json(
      { error: 'Failed to load reconciliation data' },
      { status: 500 }
    );
  }
}
