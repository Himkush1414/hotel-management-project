import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { HotelSettingsProvider } from '@/contexts/HotelSettingsContext'
import { FeatureFlagsProvider } from '@/contexts/FeatureFlagsContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title:       'HotelOS — Hotel Management System',
  description: 'Professional hotel management system for modern hotels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <HotelSettingsProvider>
            <FeatureFlagsProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
              />
            </FeatureFlagsProvider>
          </HotelSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
