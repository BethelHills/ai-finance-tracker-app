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

    // Get accounts from Plaid
    const accounts = await PlaidService.getAccounts(user.plaidAccessToken);

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
