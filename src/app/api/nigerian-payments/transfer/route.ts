import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NigerianPaymentService } from '@/lib/nigerian-payment-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      accountNumber,
      bankCode,
      amount,
      reason,
      recipientName,
      provider = 'paystack', // 'paystack' or 'flutterwave'
    } = await request.json();

    if (!accountNumber || !bankCode || !amount || !recipientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;

    if (provider === 'paystack') {
      // Create transfer recipient first
      const recipient = await NigerianPaymentService.createTransferRecipient(
        accountNumber,
        bankCode,
        recipientName
      );

      // Initiate transfer
      result = await NigerianPaymentService.initiateTransfer(
        recipient.id,
        amount,
        reason || 'AI Finance Tracker Transfer'
      );
    } else if (provider === 'flutterwave') {
      // Use Flutterwave for transfer
      result = await NigerianPaymentService.createFlutterwaveTransfer(
        bankCode,
        accountNumber,
        amount,
        reason || 'AI Finance Tracker Transfer',
        recipientName
      );
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error processing transfer:', error);
    return NextResponse.json(
      { error: 'Failed to process transfer' },
      { status: 500 }
    );
  }
}
