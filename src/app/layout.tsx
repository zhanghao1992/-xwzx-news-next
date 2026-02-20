import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '新闻资讯',
  description: 'Next.js 新闻应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
