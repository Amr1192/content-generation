import Link from 'next/link'
import { Sparkles, Zap, TrendingUp, BarChart3 } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            {/* Hero Section */}
            <main className="container py-16">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-6 inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
                        <Zap className="mr-2 h-4 w-4" />
                        AI-Powered Content Creation
                    </div>

                    <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                        Turn <span className="text-primary-600">1 Idea</span> into{' '}
                        <span className="text-primary-600">30+ Posts</span>
                    </h1>

                    <p className="mb-10 text-xl text-gray-600">
                        AI-powered social media content engine that generates posts, reels, captions,
                        hashtags, and designs in seconds. No more manual content creation.
                    </p>

                    <div className="flex justify-center space-x-4">
                        <Link href="/signup" className="btn btn-primary px-8 py-3 text-base">
                            Start Creating Free
                        </Link>
                        <Link href="#features" className="btn btn-secondary px-8 py-3 text-base">
                            See How It Works
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-primary-600">30+</div>
                        <div className="text-gray-600">Posts Generated</div>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-primary-600">10</div>
                        <div className="text-gray-600">Reel Scripts</div>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-primary-600">100%</div>
                        <div className="text-gray-600">AI-Powered</div>
                    </div>
                </div>

                {/* Features */}
                <div id="features" className="mt-32">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
                        Everything You Need to Dominate Social Media
                    </h2>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon={<Sparkles className="h-6 w-6" />}
                            title="AI Content Generation"
                            description="Generate 30+ unique posts from a single idea with platform-specific optimization"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-6 w-6" />}
                            title="Smart Hashtags"
                            description="Get trending, relevant hashtags with competition analysis for maximum reach"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6" />}
                            title="Auto Design Templates"
                            description="Beautiful, branded designs generated automatically for every post"
                        />
                        <FeatureCard
                            icon={<Zap className="h-6 w-6" />}
                            title="Reel Scripts"
                            description="Viral-ready short-form video scripts with scene breakdowns"
                        />
                        <FeatureCard
                            icon={<Sparkles className="h-6 w-6" />}
                            title="Captions & Copy"
                            description="Engaging captions with hooks, CTAs, and perfect formatting"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-6 w-6" />}
                            title="Multi-Platform"
                            description="Optimized for Instagram, TikTok, Facebook, LinkedIn, and Twitter"
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-32 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 p-12 text-center text-white">
                    <h2 className="mb-4 text-3xl font-bold">Ready to 10x Your Content Creation?</h2>
                    <p className="mb-8 text-lg text-purple-100">
                        Join thousands of creators who save hours every week with AI
                    </p>
                    <Link href="/signup" className="inline-flex items-center rounded-lg bg-white px-8 py-3 text-base font-medium text-primary-600 hover:bg-gray-100">
                        Get Started for Free
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="container border-t border-gray-200 py-8 text-center text-gray-600">
                <p>&copy; 2026 ContentKing. All rights reserved.</p>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="card hover:shadow-md transition-shadow">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                {icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}
