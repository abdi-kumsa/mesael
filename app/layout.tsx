import type { Metadata } from 'next';
import { Inter, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mesael Construction Operations Platform — Finance & Tax',
  description: 'Enterprise finance workflow, hard document gating, RBAC approvals, tax engine, and Peachtree integration for Mesael Construction.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <body className="bg-[#fbfaf8] text-[#15181e] antialiased selection:bg-[#f3d3b3] selection:text-[#8f3d0b]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
