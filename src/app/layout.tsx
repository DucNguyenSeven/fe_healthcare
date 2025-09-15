import type { Metadata } from 'next'
import './globals.css'

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
        <div id="root" className="h-full w-full">
          {children}
        </div>
      </body>
    </html>
  )
}
