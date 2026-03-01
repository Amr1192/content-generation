'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Zap, TrendingUp, BarChart3, ArrowRight, LogOut } from 'lucide-react'

export default function DashboardPage() {
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.replace('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                        <p className="mt-2 text-gray-600">
                            Ready to create amazing content today?
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary inline-flex items-center"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Posts"
                        value="0"
                        icon={<BarChart3 className="h-6 w-6" />}
                        color="purple"
                    />
                    <StatCard
                        title="This Week"
                        value="0"
                        icon={<TrendingUp className="h-6 w-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="Designs Created"
                        value="0"
                        icon={<Sparkles className="h-6 w-6" />}
                        color="pink"
                    />
                    <StatCard
                        title="Time Saved"
                        value="0h"
                        icon={<Zap className="h-6 w-6" />}
                        color="green"
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <ActionCard
                            title="Generate Content"
                            description="Create 30+ posts from a single idea"
                            icon={<Zap className="h-8 w-8" />}
                            href="/generate"
                            color="purple"
                        />
                        <ActionCard
                            title="View History"
                            description="Access your previously generated content"
                            icon={<BarChart3 className="h-8 w-8" />}
                            href="/history"
                            color="blue"
                        />
                        <ActionCard
                            title="Settings"
                            description="Customize your content preferences"
                            icon={<Sparkles className="h-8 w-8" />}
                            href="/settings"
                            color="pink"
                        />
                    </div>
                </div>

                {/* Getting Started */}
                <div className="card bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Ready to get started?
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Generate your first batch of content in just a few clicks. Our AI will create
                                engaging posts, captions, and hashtags tailored to your needs.
                            </p>
                            <Link
                                href="/generate"
                                className="btn btn-primary inline-flex items-center group"
                            >
                                <span>Start Generating</span>
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="hidden lg:block ml-8">
                            <Sparkles className="h-24 w-24 text-primary-400" />
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Activity</h2>
                    <div className="card text-center text-gray-500 py-12">
                        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-lg font-medium text-gray-700 mb-2">No activity yet</p>
                        <p className="text-sm">Your generated content will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string
    value: string
    icon: React.ReactNode
    color: 'purple' | 'blue' | 'pink' | 'green'
}) {
    const colorClasses = {
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        pink: 'bg-pink-100 text-pink-600',
        green: 'bg-green-100 text-green-600',
    }

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function ActionCard({
    title,
    description,
    icon,
    href,
    color,
}: {
    title: string
    description: string
    icon: React.ReactNode
    href: string
    color: 'purple' | 'blue' | 'pink'
}) {
    const colorClasses = {
        purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
        blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
        pink: 'bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white',
    }

    return (
        <Link href={href} className="card hover:shadow-lg transition-all group">
            <div className={`inline-flex rounded-lg p-3 mb-4 transition-colors ${colorClasses[color]}`}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </Link>
    )
}
