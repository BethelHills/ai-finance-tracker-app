import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { LedgerService } from '@/lib/database/ledger-models';

const prisma = new PrismaClient();

// Webhook signature verification
function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}

// Idempotency key management
const processedWebhooks = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('Missing Paystack signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    if (!verifyPaystackSignature(payload, signature)) {
      console.error('Invalid Paystack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);
    const eventId = event.data?.id || event.id;

    // Check idempotency
    if (processedWebhooks.has(eventId)) {
      console.log(`Webhook ${eventId} already processed`);
      return NextResponse.json({ message: 'Already processed' });
    }

    // Mark as processed
    processedWebhooks.add(eventId);

    console.log(`Processing Paystack webhook: ${event.event}`);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;
      
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
      
      case 'transfer.failed':
        await handleTransferFailed(event.data);
        break;
      
      case 'transfer.reversed':
        await handleTransferReversed(event.data);
        break;
      
      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;
      
      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;
      
      case 'invoice.create':
        await handleInvoiceCreate(event.data);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data);
        break;
      
      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'paystack',
        eventType: event.event,
        payload: event,
        processed: true,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    
    // Log failed webhook
    try {
      await prisma.webhookEvent.create({
        data: {
          provider: 'paystack',
          eventType: 'unknown',
          payload: { error: error instanceof Error ? error.message : 'Unknown error' },
          processed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Event handlers
async function handleChargeSuccess(data: any) {
  console.log('Charge successful:', data.reference);
  
  // Update transaction status in database
  await prisma.transaction.updateMany({
    where: {
      external_id: data.reference,
      provider: 'paystack',
    },
    data: {
      status: 'completed',
      metadata: {
        paystackData: data,
        processedAt: new Date().toISOString(),
      },
    },
  });

  // Update account balance if needed
  // This would depend on your business logic
}

async function handleChargeFailed(data: any) {
  console.log('Charge failed:', data.reference);
  
  await prisma.transaction.updateMany({
    where: {
      external_id: data.reference,
      provider: 'paystack',
    },
    data: {
      status: 'failed',
      metadata: {
        paystackData: data,
        error: data.gateway_response,
        processedAt: new Date().toISOString(),
      },
    },
  });
}

async function handleTransferSuccess(data: any) {
  console.log('Transfer successful:', data.reference);
  
  // Find the transaction by reference
  const transaction = await prisma.transaction.findFirst({
    where: {
      external_id: data.reference,
      provider: 'paystack',
    },
  });

  if (transaction) {
    // Update transaction status
    await LedgerService.updateTransactionStatus(
      transaction.id,
      'completed',
      {
        paystackData: data,
        processedAt: new Date().toISOString(),
        paystackStatus: data.status,
      }
    );

    // Update recipient last used
    await prisma.transferRecipient.updateMany({
      where: {
        paystackRecipientId: data.recipient.id.toString(),
      },
      data: {
        lastUsedAt: new Date(),
      },
    });
  }
}

async function handleTransferFailed(data: any) {
  console.log('Transfer failed:', data.reference);
  
  // Find the transaction by reference
  const transaction = await prisma.transaction.findFirst({
    where: {
      external_id: data.reference,
      provider: 'paystack',
    },
  });

  if (transaction) {
    // Update transaction status
    await LedgerService.updateTransactionStatus(
      transaction.id,
      'failed',
      {
        paystackData: data,
        error: data.failure_reason || 'Transfer failed',
        processedAt: new Date().toISOString(),
        paystackStatus: data.status,
      }
    );

    // Reverse the account balance if it was previously completed
    if (transaction.status === 'completed') {
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: Math.abs(transaction.amount), // Add back the amount
          },
        },
      });
    }
  }
}

async function handleTransferReversed(data: any) {
  console.log('Transfer reversed:', data.reference);
  
  // Find the transaction by reference
  const transaction = await prisma.transaction.findFirst({
    where: {
      external_id: data.reference,
      provider: 'paystack',
    },
  });

  if (transaction) {
    // Update transaction status
    await LedgerService.updateTransactionStatus(
      transaction.id,
      'reversed',
      {
        paystackData: data,
        processedAt: new Date().toISOString(),
        paystackStatus: data.status,
      }
    );

    // Reverse the account balance
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          increment: Math.abs(transaction.amount), // Add back the amount
        },
      },
    });
  }
}

async function handleSubscriptionCreate(data: any) {
  console.log('Subscription created:', data.subscription_code);
  
  // Handle subscription creation
  // This would depend on your subscription logic
}

async function handleSubscriptionDisable(data: any) {
  console.log('Subscription disabled:', data.subscription_code);
  
  // Handle subscription disable
  // This would depend on your subscription logic
}

async function handleInvoiceCreate(data: any) {
  console.log('Invoice created:', data.invoice_number);
  
  // Handle invoice creation
  // This would depend on your invoice logic
}

async function handleInvoicePaymentFailed(data: any) {
  console.log('Invoice payment failed:', data.invoice_number);
  
  // Handle invoice payment failure
  // This would depend on your invoice logic
}

// Clean up old processed webhooks (run this periodically)
export async function cleanupProcessedWebhooks() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  // Remove old webhook IDs from memory
  // In production, you'd want to use Redis or a database for this
  for (const webhookId of processedWebhooks) {
    // This is a simplified cleanup - in production you'd track timestamps
    if (Math.random() < 0.1) { // 10% chance to clean up
      processedWebhooks.delete(webhookId);
    }
  }
}