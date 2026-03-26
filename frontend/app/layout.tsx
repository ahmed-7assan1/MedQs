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
        <title>MedQs — Medical Questions Platform</title>
        <meta name="description" content="Master clinical knowledge with MedQs - AI-powered question bank for medical learning" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
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