import type { Metadata } from 'next';
import ClientLayout from '@/components/layout/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'possibility GmbH',
  description:
    'possibility GmbH - Ihr Partner für innovative Lösungen und digitale Transformation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
