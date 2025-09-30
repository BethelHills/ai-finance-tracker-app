import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock institutions data - in production, this would come from Plaid API
    const institutions = [
      {
        institution_id: 'ins_1',
        name: 'Chase Bank',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://chase.com',
        primary_color: '#0066b2',
        logo: 'https://logo.clearbit.com/chase.com',
      },
      {
        institution_id: 'ins_2',
        name: 'Bank of America',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://bankofamerica.com',
        primary_color: '#e31837',
        logo: 'https://logo.clearbit.com/bankofamerica.com',
      },
      {
        institution_id: 'ins_3',
        name: 'Wells Fargo',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://wellsfargo.com',
        primary_color: '#d71e2b',
        logo: 'https://logo.clearbit.com/wellsfargo.com',
      },
      {
        institution_id: 'ins_4',
        name: 'Capital One',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://capitalone.com',
        primary_color: '#004977',
        logo: 'https://logo.clearbit.com/capitalone.com',
      },
      {
        institution_id: 'ins_5',
        name: 'Citibank',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://citi.com',
        primary_color: '#056dae',
        logo: 'https://logo.clearbit.com/citi.com',
      },
      {
        institution_id: 'ins_6',
        name: 'US Bank',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://usbank.com',
        primary_color: '#003366',
        logo: 'https://logo.clearbit.com/usbank.com',
      },
      {
        institution_id: 'ins_7',
        name: 'PNC Bank',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://pnc.com',
        primary_color: '#f48020',
        logo: 'https://logo.clearbit.com/pnc.com',
      },
      {
        institution_id: 'ins_8',
        name: 'TD Bank',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://tdbank.com',
        primary_color: '#53a318',
        logo: 'https://logo.clearbit.com/tdbank.com',
      },
      {
        institution_id: 'ins_9',
        name: 'HSBC',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://us.hsbc.com',
        primary_color: '#db0032',
        logo: 'https://logo.clearbit.com/us.hsbc.com',
      },
      {
        institution_id: 'ins_10',
        name: 'American Express',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US'],
        url: 'https://americanexpress.com',
        primary_color: '#006fcf',
        logo: 'https://logo.clearbit.com/americanexpress.com',
      },
    ];

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error('Institutions API error:', error);
    return NextResponse.json(
      { error: 'Failed to load institutions' },
      { status: 500 }
    );
  }
}
