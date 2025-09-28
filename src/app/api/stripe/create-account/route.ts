import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { StripeService } from '@/lib/stripe-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, country } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create Stripe Connect account
    const stripeAccount = await StripeService.createConnectAccount(
      session.user.id,
      email,
      country || 'US'
    );

    // Store Stripe account ID in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        stripeAccountId: stripeAccount.id,
      },
    });

    return NextResponse.json({
      success: true,
      account: stripeAccount,
    });
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
