import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

  // Debug logging
  console.log('Supabase URL:', url);
  console.log('Supabase Key (first 20 chars):', key.substring(0, 20) + '...');

  return createBrowserClient(url, key);
}
