import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PaystackIntegration } from '@/lib/paystack-integration';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/paystack/recipients - List all transfer recipients
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');

    // Get recipients from Paystack
    const paystackRecipients = await PaystackIntegration.listTransferRecipients(page, perPage);

    // Also get local recipients from database
    const localRecipients = await prisma.transferRecipient.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        paystack: paystackRecipients.recipients,
        local: localRecipients,
        pagination: {
          page,
          perPage,
          total: paystackRecipients.total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recipients',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/paystack/recipients - Create a new transfer recipient
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, accountNumber, bankCode, description } = body;

    // Validate required fields
    if (!name || !email || !accountNumber || !bankCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, accountNumber, bankCode' },
        { status: 400 }
      );
    }

    // Create recipient in Paystack
    const paystackRecipient = await PaystackIntegration.createTransferRecipient(
      name,
      email,
      accountNumber,
      bankCode
    );

    // Save recipient to local database
    const localRecipient = await prisma.transferRecipient.create({
      data: {
        userId: session.user.id,
        paystackRecipientId: paystackRecipient.id.toString(),
        name: paystackRecipient.name,
        email: paystackRecipient.email,
        accountNumber: paystackRecipient.account_number,
        bankCode: paystackRecipient.bank_code,
        bankName: paystackRecipient.bank_name,
        description: description || '',
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Recipient created successfully',
      data: {
        paystack: paystackRecipient,
        local: localRecipient,
      },
    });
  } catch (error) {
    console.error('Error creating recipient:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create recipient',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
