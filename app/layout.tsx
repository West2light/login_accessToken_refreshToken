import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'LIMS App',
  description: 'Laboratory Information Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AntdRegistry>
            {children}
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}