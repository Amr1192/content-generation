import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import AppNavbar from '@/components/app-navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ContentKing - AI Social Media Content Engine',
    description: 'Transform one idea into 30+ posts and 10 reels with AI-powered content generation',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <AppNavbar />
                    {children}
                </Providers>
            </body>
        </html>
    )
}
