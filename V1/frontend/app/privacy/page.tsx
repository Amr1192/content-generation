import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
                        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-600 mb-6">Last updated: February 2, 2026</p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                        <p className="text-gray-700 mb-4">
                            We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                        <p className="text-gray-700 mb-4">
                            We use the information we collect to provide, maintain, and improve our services, and to communicate with you.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
                        <p className="text-gray-700 mb-4">
                            We do not share your personal information with third parties except as described in this policy.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
                        <p className="text-gray-700 mb-4">
                            We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
                        <p className="text-gray-700 mb-4">
                            You have the right to access, update, or delete your personal information at any time.
                        </p>

                        <p className="text-gray-600 mt-8">
                            For privacy-related questions, please contact us at privacy@contentking.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
