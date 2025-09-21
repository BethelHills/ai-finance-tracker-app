import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { MongoDBService } from '@/lib/mongodb-models';
import { QueueManager } from '@/lib/queue';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing paystack signature' },
        { status: 400 }
      );
    }

    // Verify Paystack signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Save webhook event to MongoDB
    const eventId = await MongoDBService.saveWebhookEvent({
      provider: 'paystack',
      eventType: payload.event,
      payload,
      processed: false,
      retryCount: 0,
    });

    // Add to webhook processing queue
    await QueueManager.addWebhookProcessing(
      eventId,
      'paystack',
      payload.event,
      payload
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
