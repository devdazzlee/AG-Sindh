import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth-context'

export const metadata: Metadata = {
  title: 'AG Sindh Dashboard',
  description: 'AG Sindh Records Management System',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
