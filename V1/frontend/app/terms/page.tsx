import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <div className="container py-12">
                <Link href="/" className="inline-flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Home</span>
                </Link>

                <div className="max-w-4xl mx-auto card">
                    <div className="flex items-center space-x-2 mb-6">
                        <Sparkles className="h-8 w-8 text-primary-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-600 mb-6">Last updated: February 2, 2026</p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-700 mb-4">
                            By accessing and using ContentKing, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use License</h2>
                        <p className="text-gray-700 mb-4">
                            Permission is granted to temporarily use ContentKing for personal, non-commercial transitory viewing only.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
                        <p className="text-gray-700 mb-4">
                            You are responsible for maintaining the confidentiality of your account and password.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Content Ownership</h2>
                        <p className="text-gray-700 mb-4">
                            All content generated through ContentKing belongs to you. We do not claim ownership of your content.
                        </p>

                        <p className="text-gray-600 mt-8">
                            For questions about these Terms, please contact us at support@contentking.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
