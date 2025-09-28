import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from './components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoteVision - Shape the Future of Video Content',
  description: 'A platform for communities to collectively decide on video themes and styles using blockchain voting, with AI-powered video generation.',
  keywords: ['blockchain', 'voting', 'video', 'AI', 'community', 'Base', 'Web3'],
  authors: [{ name: 'VoteVision Team' }],
  openGraph: {
    title: 'VoteVision - Shape the Future of Video Content',
    description: 'Democratically shape video content with blockchain voting and AI generation',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
