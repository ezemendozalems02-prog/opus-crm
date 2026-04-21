import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Opus Prospect CRM — Argentina',
  description: 'CRM de prospección para Argentina por Instagram y WhatsApp',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
