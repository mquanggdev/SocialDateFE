import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/authContext';
import { SocketProvider } from '@/contexts/socketContext';

export const metadata: Metadata = {
  title: 'Date And Live',
  description: 'It is a blessing to have friends and a partner.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          <AuthProvider>{children}</AuthProvider>
        </SocketProvider>
      </body>
    </html>
  );
}