import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'trick.io.vn - Gia hạn ChatGPT Plus',
  description: 'Dịch vụ gia hạn ChatGPT Plus tự động bằng CDK code. Nhanh chóng, an toàn, 24/7.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
