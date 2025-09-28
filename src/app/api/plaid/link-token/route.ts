import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PlaidService } from '@/lib/plaid-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const linkToken = await PlaidService.createLinkToken(session.user.id);

    return NextResponse.json({ link_token: linkToken });
  } catch (error) {
    console.error('Error creating link token:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
