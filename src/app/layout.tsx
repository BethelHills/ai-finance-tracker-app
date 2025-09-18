import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { MobileHeader } from '@/components/mobile-navigation';
import { ToastProvider } from '@/components/toast-provider';
import { UserSettingsProvider } from '@/contexts/user-settings-context';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Finance Tracker',
  description:
    'Intelligent personal finance management with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UserSettingsProvider>
              <Providers>
                <ToastProvider />
                <MobileHeader />
                {children}
              </Providers>
            </UserSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
