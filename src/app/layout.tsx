import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Opus Prospect CRM — Argentina',
  description: 'CRM de prospección para Argentina por Instagram y WhatsApp',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
