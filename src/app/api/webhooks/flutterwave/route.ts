import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { MongoDBService } from '@/lib/mongodb-models';
import { QueueManager } from '@/lib/queue';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('verif-hash');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing flutterwave signature' },
        { status: 400 }
      );
    }

    // Verify Flutterwave signature
    const hash = crypto
      .createHmac('sha256', process.env.FLUTTERWAVE_SECRET_KEY!)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Save webhook event to MongoDB
    const eventId = await MongoDBService.saveWebhookEvent({
      provider: 'flutterwave',
      eventType: payload.event.type,
      payload,
      processed: false,
      retryCount: 0,
    });

    // Add to webhook processing queue
    await QueueManager.addWebhookProcessing(
      eventId,
      'flutterwave',
      payload.event.type,
      payload
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
