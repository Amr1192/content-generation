'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { contentApi } from '@/lib/api'
import { Sparkles, Loader2, Download, Copy, Check } from 'lucide-react'

export default function GeneratePage() {
    const [idea, setIdea] = useState('')
    const [platform, setPlatform] = useState('instagram')
    const [count, setCount] = useState(30)
    const [tone, setTone] = useState('professional')
    const [generateDesigns, setGenerateDesigns] = useState(false)
    const [copiedId, setCopiedId] = useState<number | null>(null)

    const generateMutation = useMutation({
        mutationFn: contentApi.generate,
    })

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!idea.trim()) return

        generateMutation.mutate({
            idea,
            platform,
            count,
            tone,
            generate_designs: generateDesigns,
            design_style: 'minimal',
        })
    }

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Generate Content</h1>
                    <p className="mt-2 text-gray-600">
                        Transform your idea into 30+ ready-to-post content pieces
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Input Form */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handleGenerate} className="card sticky top-8">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Content Settings
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Your Idea
                                    </label>
                                    <textarea
                                        value={idea}
                                        onChange={(e) => setIdea(e.target.value)}
                                        placeholder="E.g., 5 tips for productivity, benefits of meditation, how to start a business..."
                                        className="input min-h-[120px] resize-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Platform
                                    </label>
                                    <select
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        className="input"
                                    >
                                        <option value="instagram">Instagram</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="twitter">Twitter/X</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="tiktok">TikTok</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Tone
                                    </label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="input"
                                    >
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="funny">Funny</option>
                                        <option value="inspirational">Inspirational</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Number of Posts
                                    </label>
                                    <input
                                        type="number"
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value))}
                                        min="1"
                                        max="50"
                                        className="input"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="designs"
                                        checked={generateDesigns}
                                        onChange={(e) => setGenerateDesigns(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                    />
                                    <label htmlFor="designs" className="ml-2 text-sm text-gray-700">
                                        Generate designs
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={generateMutation.isPending || !idea.trim()}
                                    className="btn btn-primary w-full"
                                >
                                    {generateMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Content
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-2">
                        {generateMutation.isPending && (
                            <div className="card text-center">
                                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Creating your content...
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    AI is generating {count} unique posts for you
                                </p>
                            </div>
                        )}

                        {generateMutation.isError && (
                            <div className="card border-red-200 bg-red-50">
                                <h3 className="text-lg font-semibold text-red-900">
                                    Generation Failed
                                </h3>
                                <p className="mt-2 text-red-700">
                                    {(generateMutation.error as any)?.message || 'An error occurred'}
                                </p>
                            </div>
                        )}

                        {generateMutation.isSuccess && (
                            <div className="space-y-4">
                                <div className="card bg-green-50 border-green-200">
                                    <h3 className="text-lg font-semibold text-green-900">
                                        ✨ Success! Generated {generateMutation.data.count} posts
                                    </h3>
                                    <p className="mt-1 text-green-700">
                                        Your content is ready to use
                                    </p>
                                </div>

                                {generateMutation.data.posts.map((post: any, index: number) => (
                                    <div key={index} className="card hover:shadow-md transition-shadow">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-500">
                                                    {post.content_type}
                                                </span>
                                                {post.estimated_engagement && (
                                                    <span className={`text-xs px-2 py-1 rounded-full ${post.estimated_engagement === 'high'
                                                            ? 'bg-green-100 text-green-700'
                                                            : post.estimated_engagement === 'medium'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {post.estimated_engagement} engagement
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(post.content, index)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedId === index ? (
                                                    <Check className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Copy className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>

                                        <div className="mb-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-gray-900">
                                            {post.content}
                                        </div>

                                        {post.caption && (
                                            <div className="mb-4">
                                                <h4 className="mb-2 text-sm font-semibold text-gray-700">
                                                    Caption:
                                                </h4>
                                                <div className="whitespace-pre-wrap rounded-lg bg-blue-50 p-3 text-sm text-gray-900">
                                                    {post.caption}
                                                </div>
                                            </div>
                                        )}

                                        {post.hashtags && post.hashtags.length > 0 && (
                                            <div>
                                                <h4 className="mb-2 text-sm font-semibold text-gray-700">
                                                    Hashtags:
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {post.hashtags.map((tag: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!generateMutation.isPending &&
                            !generateMutation.isSuccess &&
                            !generateMutation.isError && (
                                <div className="card text-center text-gray-500">
                                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <p>Enter your idea and click generate to create content</p>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}
