import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorToast } from '@/components/error-toast';
import { OfflineBanner } from '@/components/offline-banner';
import { ClientProviders } from '@/components/client-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Vault - Weekly Prize Pool',
  description: 'Join The Vault for a chance to win the weekly prize pool. New winner every Sunday!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ClientProviders>
            <OfflineBanner />
            {children}
            <Toaster />
            <ErrorToast />
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}