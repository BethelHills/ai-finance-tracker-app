'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
            <span className='text-white font-bold text-xl'>AI</span>
          </div>
          <h1 className='mt-6 text-3xl font-bold text-gray-900'>
            AI Finance Tracker
          </h1>
          <p className='mt-2 text-sm text-gray-600'>
            Secure, intelligent financial management
          </p>
        </div>
        <SignupForm onSuccess={() => router.push('/dashboard')} />
      </div>
    </div>
  );
}
