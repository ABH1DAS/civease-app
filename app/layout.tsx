import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { HighlightInit } from '@highlight-run/next/client'

export const metadata: Metadata = {
  title: 'CivEase',
  description: 'Created By ByteBloom',
  icons: {
    icon: "/logo.ico.png", 
  },

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <HighlightInit
        projectId={'zg0y23nd'}
        serviceName="my-nextjs-frontend"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [],
        }}
      />
      <html lang="en">
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          {children}
          <Analytics />
        </body>
      </html>
    </>
  )
}
