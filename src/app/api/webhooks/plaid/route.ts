import { NextRequest, NextResponse } from 'next/server';
import { MongoDBService } from '@/lib/mongodb-models';
import { QueueManager } from '@/lib/queue';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Save webhook event to MongoDB
    const eventId = await MongoDBService.saveWebhookEvent({
      provider: 'plaid',
      eventType: payload.webhook_type,
      payload,
      processed: false,
      retryCount: 0,
    });

    // Add to webhook processing queue
    await QueueManager.addWebhookProcessing(
      eventId,
      'plaid',
      payload.webhook_type,
      payload
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Plaid webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
