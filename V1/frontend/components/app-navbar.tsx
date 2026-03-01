'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const LINKS = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/generate', label: 'Generate' },
    { href: '/history', label: 'History' },
    { href: '/settings', label: 'Settings' },
    { href: '/settings?tab=social', label: 'Social' },
]

export default function AppNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isAuthed, setIsAuthed] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsAuthed(Boolean(token))
    }, [pathname])

    const onLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthed(false)
        router.replace('/login')
    }

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
            <nav className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Sparkles className="h-7 w-7 text-primary-600" />
                    <span className="text-xl font-bold text-gray-900">ContentKing</span>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    {isAuthed && LINKS.map((link) => {
                        const active = pathname === link.href || (link.href.startsWith('/settings') && pathname === '/settings')
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm ${active ? 'text-primary-700 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}

                    {!isAuthed ? (
                        <>
                            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
                            <Link href="/signup" className="btn btn-primary">Get Started</Link>
                        </>
                    ) : (
                        <button onClick={onLogout} className="btn btn-secondary">Logout</button>
                    )}
                </div>
            </nav>
        </header>
    )
}
