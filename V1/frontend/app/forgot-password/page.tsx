import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
                    <Sparkles className="h-8 w-8 text-primary-600" />
                    <span className="text-2xl font-bold text-gray-900">ContentKing</span>
                </Link>

                <div className="card backdrop-blur-sm bg-white/80 shadow-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                        <p className="text-gray-600">Enter your email to receive a reset link</p>
                    </div>

                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-full">
                            Send Reset Link
                        </button>
                    </form>

                    <Link href="/login" className="mt-6 flex items-center justify-center text-sm text-primary-600 hover:text-primary-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
