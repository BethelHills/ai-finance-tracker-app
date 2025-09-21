import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PlaidService } from '@/lib/plaid-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { public_token } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'Public token is required' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const accessToken = await PlaidService.exchangePublicToken(public_token);

    // Get accounts from Plaid
    const accounts = await PlaidService.getAccounts(accessToken);

    // Store access token and accounts in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        plaidAccessToken: accessToken,
        plaidItemId: accounts[0]?.account_id, // Store first account ID as item ID
      },
    });

    // Store accounts
    for (const account of accounts) {
      await prisma.account.upsert({
        where: { 
          plaidAccountId: account.account_id 
        },
        update: {
          name: account.name,
          type: account.type.toUpperCase() as any,
          balance: account.balances.current || 0,
          currency: account.balances.iso_currency_code || 'USD',
          plaidAccountId: account.account_id,
          plaidMask: account.mask,
        },
        create: {
          name: account.name,
          type: account.type.toUpperCase() as any,
          balance: account.balances.current || 0,
          currency: account.balances.iso_currency_code || 'USD',
          userId: session.user.id,
          plaidAccountId: account.account_id,
          plaidMask: account.mask,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      accounts: accounts.length 
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
