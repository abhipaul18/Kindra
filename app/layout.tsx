import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/src/index.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KINDRA - Together We Act. Together We Build.',
  description: 'AI-Powered Civic Engagement Platform enabling citizens to report issues, volunteer, and earn Karma rewards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" class="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.className} bg-background text-on-background min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
