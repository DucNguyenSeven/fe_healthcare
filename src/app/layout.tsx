import React from 'react';
import ThemeRegistry from '../theme/ThemeRegistry';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata = {
  title: 'Healthcare App',
  description: 'A health consultation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}