import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PlaidService } from '@/lib/plaid-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

    // Get user's Plaid access token
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plaidAccessToken: true },
    });

    if (!user?.plaidAccessToken) {
      return NextResponse.json(
        { error: 'No Plaid account linked' },
        { status: 400 }
      );
    }

    // Get transactions from Plaid
    const transactions = await PlaidService.getAllTransactions(
      user.plaidAccessToken,
      startDate,
      endDate
    );

    // Categorize transactions using AI
    const categorizedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const categorization = await PlaidService.categorizeTransaction(transaction);
        
        // Store transaction in database
        await prisma.transaction.upsert({
          where: { plaidTransactionId: transaction.transaction_id },
          update: {
            amount: transaction.amount,
            description: transaction.name,
            date: new Date(transaction.date),
            type: transaction.amount > 0 ? 'INCOME' : 'EXPENSE',
            aiCategory: categorization.category,
            aiConfidence: categorization.confidence,
            aiTags: categorization.tags,
            plaidTransactionId: transaction.transaction_id,
            plaidAccountId: transaction.account_id,
          },
          create: {
            amount: transaction.amount,
            description: transaction.name,
            date: new Date(transaction.date),
            type: transaction.amount > 0 ? 'INCOME' : 'EXPENSE',
            userId: session.user.id,
            accountId: (await prisma.account.findFirst({
              where: { plaidAccountId: transaction.account_id }
            }))?.id || '',
            aiCategory: categorization.category,
            aiConfidence: categorization.confidence,
            aiTags: categorization.tags,
            plaidTransactionId: transaction.transaction_id,
            plaidAccountId: transaction.account_id,
          },
        });

        return {
          ...transaction,
          aiCategory: categorization.category,
          aiConfidence: categorization.confidence,
          aiTags: categorization.tags,
        };
      })
    );

    return NextResponse.json({ 
      transactions: categorizedTransactions,
      count: categorizedTransactions.length 
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
