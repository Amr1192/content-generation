'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Home, Zap, History, Settings, LogOut } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Generate', href: '/generate', icon: Zap },
        { name: 'History', href: '/history', icon: History },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center border-b border-gray-200 px-6">
                        <Link href="/" className="flex items-center space-x-2">
                            <Sparkles className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">ContentKing</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="mb-3 flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white font-semibold">
                                U
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">User Name</p>
                                <p className="text-xs text-gray-500 truncate">user@example.com</p>
                            </div>
                        </div>
                        <button className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="pl-64">
                {children}
            </div>
        </div>
    )
}
