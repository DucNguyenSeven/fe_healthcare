import React from 'react';
import ThemeRegistry from '../theme/ThemeRegistry';

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
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}