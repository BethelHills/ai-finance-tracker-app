import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SecureLoginFlow } from '@/components/auth/secure-login-flow';

export default function SecureLoginPage() {
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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='mx-auto h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4'>
            <span className='text-white font-bold text-xl'>AI</span>
          </div>
          <h1 className='text-3xl font-bold text-gray-900'>
            AI Finance Tracker
          </h1>
          <p className='mt-2 text-sm text-gray-600'>
            Secure, intelligent financial management
          </p>
        </div>
        
        <SecureLoginFlow onSuccess={() => router.push('/dashboard')} />
      </div>
    </div>
  );
}
