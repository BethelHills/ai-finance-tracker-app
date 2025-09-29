'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const supabase = createClient();

      // Test connection
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: 'Test User' },
        },
      });

      setResult({ data, error });
    } catch (error) {
      setResult({ error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Supabase Auth Test</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Email</label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type='email'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Password</label>
            <Input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type='password'
            />
          </div>
          <Button
            onClick={testSupabaseConnection}
            disabled={loading}
            className='w-full'
          >
            {loading ? 'Testing...' : 'Test Supabase Connection'}
          </Button>

          {result && (
            <div className='mt-4 p-4 bg-gray-100 rounded'>
              <h3 className='font-medium mb-2'>Result:</h3>
              <pre className='text-xs overflow-auto'>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
