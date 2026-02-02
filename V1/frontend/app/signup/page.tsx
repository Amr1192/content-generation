'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Sparkles, Mail, Lock, User, ArrowRight, Check } from 'lucide-react'

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // TODO: Implement signup logic
        setTimeout(() => setIsLoading(false), 1000)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-6xl relative grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Benefits */}
                <div className="hidden md:block">
                    <div className="mb-8">
                        <Link href="/" className="flex items-center space-x-2 mb-8">
                            <Sparkles className="h-8 w-8 text-primary-600" />
                            <span className="text-2xl font-bold text-gray-900">ContentKing</span>
                        </Link>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Start Creating Amazing Content Today
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Join thousands of creators who save hours every week with AI-powered content generation
                        </p>
                    </div>

                    <div className="space-y-4">
                        <BenefitItem text="Generate 30+ posts from one idea" />
                        <BenefitItem text="AI-powered hashtag research" />
                        <BenefitItem text="Automatic design templates" />
                        <BenefitItem text="Viral reel scripts" />
                        <BenefitItem text="Multi-platform optimization" />
                        <BenefitItem text="No credit card required" />
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="card backdrop-blur-sm bg-white/80 shadow-xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                            <p className="text-gray-600">Get started for free, no credit card needed</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name Input */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input pl-10"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input pl-10"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input pl-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input pl-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                    required
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                                        Terms of Service
                                    </Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full group"
                            >
                                {isLoading ? (
                                    <span>Creating account...</span>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                            </div>
                        </div>

                        {/* Social Signup */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="btn btn-secondary">
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button className="btn btn-secondary">
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BenefitItem({ text }: { text: string }) {
    return (
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-600" />
            </div>
            <span className="text-gray-700">{text}</span>
        </div>
    )
}
