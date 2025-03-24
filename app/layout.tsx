'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { api } from '@/trpc/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  );

  return (
    <html lang="en">
      <body className={cn(inter.className, 'flex flex-col min-h-screen')}>
        <api.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold text-primary">CCAL</Link>
                  </div>
                  <nav className="flex space-x-4">
                    <Link href="/generate" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Создать рацион
                    </Link>
                    <Link href="/profile" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Мой профиль
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
            {children}
          </QueryClientProvider>
        </api.Provider>
        <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center text-sm text-gray-500">
            <p>© 2025 CCAL. Все права защищены.</p>
          </div>
        </div>
      </footer>
      </body>
    </html>
  );
}
