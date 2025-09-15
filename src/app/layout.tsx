import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Healthcare Plus',
  description: 'Healthcare management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="">
      <body className="h-full w-full m-0 p-0">
        <QueryProvider>
          <AuthProvider>
            <div id="root" className="h-full w-full">
              {children}
            </div>
            <Toaster
              position="top-right"
              expand={true}
              richColors
              closeButton
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
