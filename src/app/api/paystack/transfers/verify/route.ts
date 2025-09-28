import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PaystackIntegration } from '@/lib/paystack-integration';
import { LedgerService } from '@/lib/database/ledger-models';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/paystack/transfers/verify - Verify a transfer status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Transfer reference is required' },
        { status: 400 }
      );
    }

    // Verify transfer with Paystack
    const paystackTransfer =
      await PaystackIntegration.verifyTransfer(reference);

    // Find the transaction in our ledger
    const ledgerTransaction = await prisma.transaction.findFirst({
      where: {
        description: {
          contains: reference,
        },
        userId: session.user.id,
      },
    });

    if (!ledgerTransaction) {
      return NextResponse.json(
        { error: 'Transfer not found in ledger' },
        { status: 404 }
      );
    }

    // Update transaction status based on Paystack response
    let newStatus:
      | 'pending'
      | 'completed'
      | 'failed'
      | 'reversed'
      | 'cancelled' = 'pending';

    switch (paystackTransfer.status) {
      case 'success':
      case 'completed':
        newStatus = 'completed';
        break;
      case 'failed':
      case 'cancelled':
        newStatus = 'failed';
        break;
      case 'pending':
        newStatus = 'pending';
        break;
      default:
        newStatus = 'pending';
    }

    // Update ledger transaction
    const updatedTransaction = await LedgerService.updateTransactionStatus(
      ledgerTransaction.id,
      newStatus,
      {
        paystackVerification: paystackTransfer,
        verifiedAt: new Date().toISOString(),
        paystackStatus: paystackTransfer.status,
      }
    );

    // If transfer failed, reverse the account balance
    if (newStatus === 'failed') {
      // Reverse the balance change
      await prisma.account.update({
        where: { id: ledgerTransaction.accountId },
        data: {
          balance: {
            increment: Math.abs(Number(ledgerTransaction.amount)), // Add back the amount
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer verification completed',
      data: {
        paystack: paystackTransfer,
        ledger: updatedTransaction,
        status: newStatus,
        verified: newStatus === 'completed',
      },
    });
  } catch (error) {
    console.error('Error verifying transfer:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify transfer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
