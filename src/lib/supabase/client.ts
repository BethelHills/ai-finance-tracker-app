import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

  // Enhanced debug logging
  console.log('=== SUPABASE CLIENT DEBUG ===');
  console.log('Environment URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    'Environment Key exists:',
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  console.log('Final URL:', url);
  console.log('Final Key (first 20 chars):', key.substring(0, 20) + '...');
  console.log('Is using demo values:', url === 'https://demo.supabase.co');
  console.log('=== SUPABASE CLIENT DEBUG END ===');

  return createBrowserClient(url, key);
}
