import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PaystackIntegration } from '@/lib/paystack-integration';
import { LedgerService } from '@/lib/database/ledger-models';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/paystack/transfers - List all transfers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');

    // Get transfers from Paystack
    const paystackTransfers = await PaystackIntegration.listTransfers(page, perPage);

    // Also get local transfers from database
    const localTransfers = await prisma.transaction.findMany({
      where: { 
        userId: session.user.id,
        provider: 'paystack',
        type: 'transfer'
      },
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    return NextResponse.json({
      success: true,
      data: {
        paystack: paystackTransfers.transfers,
        local: localTransfers,
        pagination: {
          page,
          perPage,
          total: paystackTransfers.total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transfers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/paystack/transfers - Initiate a new transfer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, amount, reason, reference, accountId } = body;

    // Validate required fields
    if (!recipientId || !amount || !reason || !accountId) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, amount, reason, accountId' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const recipient = await prisma.transferRecipient.findFirst({
      where: { 
        paystackRecipientId: recipientId.toString(),
        userId: session.user.id,
        isActive: true
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found or inactive' },
        { status: 404 }
      );
    }

    // Check account balance
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    if (account.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Generate reference if not provided
    const transferReference = reference || `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transfer in Paystack
    const paystackTransfer = await PaystackIntegration.initiateTransfer(
      parseInt(recipientId),
      amount,
      reason,
      transferReference
    );

    // Create transaction in ledger
    const ledgerTransaction = await LedgerService.createTransaction({
      external_id: paystackTransfer.reference,
      user_id: session.user.id,
      account_id: accountId,
      amount: -amount, // Negative for outgoing transfer
      currency: 'NGN',
      type: 'transfer',
      description: `Transfer to ${recipient.name}: ${reason}`,
      reference: transferReference,
      provider: 'paystack',
      provider_data: paystackTransfer,
      metadata: {
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientAccount: recipient.accountNumber,
        recipientBank: recipient.bankName,
        paystackTransferId: paystackTransfer.id,
        status: paystackTransfer.status,
      },
    });

    // Update recipient last used
    await prisma.transferRecipient.update({
      where: { id: recipient.id },
      data: { lastUsedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Transfer initiated successfully',
      data: {
        paystack: paystackTransfer,
        ledger: ledgerTransaction,
        recipient: {
          id: recipient.id,
          name: recipient.name,
          accountNumber: recipient.accountNumber,
          bankName: recipient.bankName,
        },
      },
    });
  } catch (error) {
    console.error('Error initiating transfer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate transfer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
