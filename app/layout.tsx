// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/shared/Nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MindMap MI — Discover How You Are Intelligent',
  description: 'A free, anonymous assessment based on Howard Gardner\'s Multiple Intelligences theory. Discover your unique intelligence profile across 10 domains.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
