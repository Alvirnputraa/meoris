import './globals.css'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth-context'

const headingFont = localFont({
  src: './fonts/default-heading-font.ttf',
  variable: '--font-heading',
  display: 'swap',
})

const bodyFont = localFont({
  src: './fonts/default-body-font.ttf.ttf',
  variable: '--font-body',
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
