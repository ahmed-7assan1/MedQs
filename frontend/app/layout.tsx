'use client';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { init } = useAuthStore();

  useEffect(() => { init(); }, [init]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>medibank — Medical Learning Platform</title>
        <meta name="description" content="The modern medical learning platform for students" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
            success: { iconTheme: { primary: '#0ea5e9', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
