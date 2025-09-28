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

    const { refresh_url, return_url } = await request.json();

    if (!refresh_url || !return_url) {
      return NextResponse.json(
        { error: 'Refresh URL and return URL are required' },
        { status: 400 }
      );
    }

    // Get user's Stripe account ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccountId: true },
    });

    if (!user?.stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account found' },
        { status: 400 }
      );
    }

    // Create account link
    const accountLinkUrl = await StripeService.createAccountLink(
      user.stripeAccountId,
      refresh_url,
      return_url
    );

    return NextResponse.json({
      account_link_url: accountLinkUrl,
    });
  } catch (error) {
    console.error('Error creating account link:', error);
    return NextResponse.json(
      { error: 'Failed to create account link' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
