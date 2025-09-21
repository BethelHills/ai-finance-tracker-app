import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PlaidService } from '@/lib/plaid-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { public_token } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'Public token is required' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const { accessToken, itemId } = await PlaidService.exchangePublicToken(public_token);

    // Update user with Plaid access token and item ID
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plaidAccessToken: accessToken,
        plaidItemId: itemId,
      },
    });

    // Fetch accounts from Plaid
    const plaidAccounts = await PlaidService.getAccounts(accessToken);

    // Create or update accounts in database
    for (const plaidAccount of plaidAccounts) {
      const existingAccount = await prisma.account.findFirst({
        where: { 
          plaidAccountId: plaidAccount.id,
          userId: session.user.id 
        },
      });

      if (existingAccount) {
        // Update existing account
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            name: plaidAccount.name || existingAccount.name,
            balance: plaidAccount.current_balance || existingAccount.balance,
            currency: plaidAccount.iso_currency_code || existingAccount.currency,
            plaidMask: plaidAccount.mask,
          },
        });
      } else {
        // Create new account
        await prisma.account.create({
          data: {
            name: plaidAccount.name || 'Unknown Account',
            type: mapPlaidAccountType(plaidAccount.type),
            balance: plaidAccount.current_balance || 0,
            currency: plaidAccount.iso_currency_code || 'USD',
            userId: session.user.id,
            plaidAccountId: plaidAccount.id,
            plaidMask: plaidAccount.mask,
          },
        });
      }
    }

    // Fetch recent transactions (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (const plaidAccount of plaidAccounts) {
      try {
        const plaidTransactions = await PlaidService.getTransactions(
          accessToken,
          plaidAccount.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        // Get the corresponding internal account
        const internalAccount = await prisma.account.findFirst({
          where: { 
            plaidAccountId: plaidAccount.id,
            userId: session.user.id 
          },
        });

        if (internalAccount) {
          // Create transactions
          for (const plaidTransaction of plaidTransactions) {
            const existingTransaction = await prisma.transaction.findFirst({
              where: { plaidTransactionId: plaidTransaction.transaction_id },
            });

            if (!existingTransaction) {
              await prisma.transaction.create({
                data: {
                  amount: plaidTransaction.amount,
                  description: plaidTransaction.name,
                  date: new Date(plaidTransaction.date),
                  type: plaidTransaction.amount > 0 ? 'INCOME' : 'EXPENSE',
                  userId: session.user.id,
                  accountId: internalAccount.id,
                  plaidTransactionId: plaidTransaction.transaction_id,
                  plaidAccountId: plaidTransaction.account_id,
                  metadata: {
                    plaidData: plaidTransaction,
                    category: plaidTransaction.category,
                    merchant: plaidTransaction.merchant_name,
                    pending: plaidTransaction.pending,
                  },
                },
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching transactions for account ${plaidAccount.id}:`, error);
        // Continue with other accounts even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account linked successfully',
      data: {
        accessToken,
        itemId,
        accountsCount: plaidAccounts.length,
      },
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to exchange public token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to map Plaid account types to our enum
function mapPlaidAccountType(plaidType: string): 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'OTHER' {
  switch (plaidType.toLowerCase()) {
    case 'depository':
      return 'CHECKING';
    case 'credit':
      return 'CREDIT';
    case 'investment':
      return 'INVESTMENT';
    case 'loan':
      return 'OTHER';
    case 'other':
      return 'OTHER';
    default:
      return 'OTHER';
  }
}