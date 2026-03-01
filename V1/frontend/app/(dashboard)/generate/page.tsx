'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { contentApi, socialApi } from '@/lib/api'
import { Sparkles, Loader2, Copy, Check, Pencil, Save, X, Share2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const BACKEND_BASE = API_BASE.replace(/\/api\/v1\/?$/, '')

type GeneratedPost = {
    id: number
    content: string
    caption?: string
    hashtags?: string[]
    design_url?: string | null
    content_type?: string
    estimated_engagement?: string
}

export default function GeneratePage() {
    const [idea, setIdea] = useState('')
    const [platform, setPlatform] = useState('instagram')
    const [count, setCount] = useState(10)
    const [tone, setTone] = useState('professional')
    const [generateDesigns, setGenerateDesigns] = useState(false)
    const [imageMode, setImageMode] = useState<'ai' | 'template'>('ai')
    const [imageStyle, setImageStyle] = useState('photorealistic')
    const [designStyle, setDesignStyle] = useState('minimal')
    const [copiedId, setCopiedId] = useState<number | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editText, setEditText] = useState('')
    const [editCaption, setEditCaption] = useState('')
    const [editHashtags, setEditHashtags] = useState('')
    const [saveError, setSaveError] = useState('')
    const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
    const [sharePlatform, setSharePlatform] = useState('all')
    const [shareMessage, setShareMessage] = useState('')
    const [shareError, setShareError] = useState('')
    const [publishMessage, setPublishMessage] = useState('')
    const [publishError, setPublishError] = useState('')

    const generateMutation = useMutation({
        mutationFn: contentApi.generate,
        onSuccess: (data) => {
            setGeneratedPosts(data.posts || [])
            setSaveError('')
            cancelEdit()
        },
    })
    const accountsQuery = useQuery({
        queryKey: ['social-accounts'],
        queryFn: socialApi.getAccounts,
    })

    const sharePostMutation = useMutation({
        mutationFn: (payload: { contentId: number; platforms?: string[] }) =>
            socialApi.sharePost(payload.contentId, payload.platforms),
        onSuccess: (data: any) => {
            setShareError('')
            setShareMessage(summarizeAndOpenShareLinks(data.share_links))
        },
        onError: (err: any) => {
            setShareMessage('')
            setShareError(
                err?.userMessage ||
                err?.response?.data?.detail ||
                'Share failed. Connect a platform in Settings > Social first.'
            )
        },
    })

    const shareBulkMutation = useMutation({
        mutationFn: (payload: { content_ids?: number[]; platforms?: string[] }) =>
            socialApi.shareBulk(payload),
        onSuccess: (data: any) => {
            setShareError('')
            let opened = 0
            const notes: string[] = []
            for (const item of data.items || []) {
                const msg = summarizeAndOpenShareLinks(item.share_links)
                if (msg.includes('Opened')) opened += 1
                if (msg.includes('Manual')) notes.push(msg)
            }
            setShareMessage(`Prepared share links for ${data.count} posts.${notes.length ? ' Some platforms require manual posting.' : ''}`)
        },
        onError: (err: any) => {
            const detail =
                err?.userMessage ||
                err?.response?.data?.detail ||
                'Bulk share failed. Connect a platform in Settings > Social first.'
            if (typeof detail === 'string' && detail.toLowerCase().includes('no connected social platforms')) {
                setShareError('')
                setShareMessage('No social accounts connected yet. Go to Settings > Social and connect at least one platform.')
                return
            }
            setShareMessage('')
            setShareError(detail)
        },
    })

    const publishPostMutation = useMutation({
        mutationFn: (payload: { contentId: number; platforms?: string[] }) =>
            socialApi.publishPost(payload.contentId, payload.platforms),
        onSuccess: (data: any) => {
            setPublishError('')
            setPublishMessage(`Publish request finished. Results: ${JSON.stringify(data.results)}`)
        },
        onError: (err: any) => {
            setPublishMessage('')
            setPublishError(
                err?.userMessage ||
                err?.response?.data?.detail ||
                'Publish failed.'
            )
        },
    })

    const publishBulkMutation = useMutation({
        mutationFn: (payload: { content_ids?: number[]; platforms?: string[] }) =>
            socialApi.publishBulk(payload),
        onSuccess: (data: any) => {
            setPublishError('')
            setPublishMessage(`Bulk publish finished for ${data.count} post(s).`)
        },
        onError: (err: any) => {
            setPublishMessage('')
            setPublishError(
                err?.userMessage ||
                err?.response?.data?.detail ||
                'Bulk publish failed.'
            )
        },
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
            generate_images: generateDesigns,
            image_mode: imageMode,
            image_style: imageStyle,
            design_style: designStyle,
        })
    }

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const startEdit = (post: GeneratedPost) => {
        setEditingId(post.id)
        setEditText(post.content || '')
        setEditCaption(post.caption || '')
        setEditHashtags((post.hashtags || []).join(', '))
        setSaveError('')
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditText('')
        setEditCaption('')
        setEditHashtags('')
    }

    const saveEdit = async (postId: number) => {
        try {
            setSaveError('')
            const tags = editHashtags
                .split(',')
                .map((t) => t.trim().replace(/^#/, ''))
                .filter(Boolean)

            await contentApi.update(postId, {
                generated_text: editText,
                caption: editCaption,
                hashtags: tags,
            })

            setGeneratedPosts((prev) =>
                prev.map((p) =>
                    p.id === postId ? { ...p, content: editText, caption: editCaption, hashtags: tags } : p
                )
            )
            cancelEdit()
        } catch (err: any) {
            setSaveError(
                err?.userMessage ||
                err?.response?.data?.detail ||
                'Failed to save edits.'
            )
        }
    }

    const summarizeAndOpenShareLinks = (links: Record<string, any>) => {
        let opened = 0
        const manual: string[] = []
        const blocked: string[] = []
        for (const platform of Object.keys(links || {})) {
            const entry = links[platform]
            if (entry?.url) {
                const win = window.open(entry.url, '_blank', 'noopener,noreferrer')
                if (win) opened += 1
                else blocked.push(platform)
            } else if (entry?.message) {
                manual.push(`${platform}: ${entry.message}`)
            }
        }
        const parts: string[] = []
        if (opened > 0) parts.push(`Opened ${opened} share window(s).`)
        if (blocked.length) parts.push(`Pop-up blocked for: ${blocked.join(', ')}.`)
        if (manual.length) parts.push(`Manual share required: ${manual.join(' | ')}`)
        return parts.join(' ')
    }

    const connectedPlatforms: string[] = (accountsQuery.data || []).map((a: any) => a.platform)

    const shareOne = (contentId: number) => {
        const platforms = sharePlatform === 'all' ? undefined : [sharePlatform]
        publishPostMutation.mutate(
            { contentId, platforms },
            {
                onError: () => {
                    sharePostMutation.mutate({ contentId, platforms })
                },
            }
        )
    }

    const shareAllGenerated = () => {
        const ids = generatedPosts.map((p) => p.id)
        if (!ids.length) return
        const platforms = sharePlatform === 'all' ? undefined : [sharePlatform]
        publishBulkMutation.mutate(
            { content_ids: ids, platforms },
            {
                onError: () => {
                    shareBulkMutation.mutate({ content_ids: ids, platforms })
                },
            }
        )
    }

    const publishOne = (contentId: number) => {
        const platforms = sharePlatform === 'all' ? undefined : [sharePlatform]
        publishPostMutation.mutate({ contentId, platforms })
    }

    const publishAllGenerated = () => {
        const ids = generatedPosts.map((p) => p.id)
        if (!ids.length) return
        const platforms = sharePlatform === 'all' ? undefined : [sharePlatform]
        publishBulkMutation.mutate({ content_ids: ids, platforms })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Generate Content</h1>
                    <p className="mt-2 text-gray-600">
                        Transform your idea into ready-to-post content pieces
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <form onSubmit={handleGenerate} className="card sticky top-8">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Content Settings</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Your Idea</label>
                                    <textarea
                                        value={idea}
                                        onChange={(e) => setIdea(e.target.value)}
                                        placeholder="E.g., 5 tips for productivity"
                                        className="input min-h-[120px] resize-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Platform</label>
                                    <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input">
                                        <option value="instagram">Instagram</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="twitter">Twitter/X</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="tiktok">TikTok</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Tone</label>
                                    <select value={tone} onChange={(e) => setTone(e.target.value)} className="input">
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="funny">Funny</option>
                                        <option value="inspirational">Inspirational</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Number of Posts</label>
                                    <input
                                        type="number"
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value || '1', 10))}
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
                                        Generate image for each post (idea-aware)
                                    </label>
                                </div>

                                {generateDesigns && (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Image Generation Mode</label>
                                            <select
                                                value={imageMode}
                                                onChange={(e) => setImageMode(e.target.value as 'ai' | 'template')}
                                                className="input"
                                            >
                                                <option value="ai">AI Image (understands your idea)</option>
                                                <option value="template">Template Card (text on design)</option>
                                            </select>
                                        </div>

                                        {imageMode === 'ai' ? (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">AI Image Style</label>
                                                <select
                                                    value={imageStyle}
                                                    onChange={(e) => setImageStyle(e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="photorealistic">Photorealistic</option>
                                                    <option value="3d render">3D Render</option>
                                                    <option value="cinematic">Cinematic</option>
                                                    <option value="illustration">Illustration</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">Template Style</label>
                                                <select
                                                    value={designStyle}
                                                    onChange={(e) => setDesignStyle(e.target.value)}
                                                    className="input"
                                                >
                                                    <option value="minimal">Minimal</option>
                                                    <option value="gradient">Gradient</option>
                                                    <option value="bold">Bold</option>
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}

                                <button type="submit" disabled={generateMutation.isPending || !idea.trim()} className="btn btn-primary w-full">
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

                    <div className="lg:col-span-2">
                        {generateMutation.isPending && (
                            <div className="card text-center">
                                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Creating your content...</h3>
                            </div>
                        )}

                        {generateMutation.isError && (
                            <div className="card border-red-200 bg-red-50">
                                <h3 className="text-lg font-semibold text-red-900">Generation Failed</h3>
                                <p className="mt-2 text-red-700">{(generateMutation.error as any)?.message || 'An error occurred'}</p>
                            </div>
                        )}

                        {generateMutation.isSuccess && (
                            <div className="space-y-4">
                                <div className="card bg-green-50 border-green-200">
                                    <h3 className="text-lg font-semibold text-green-900">Success! Generated {generatedPosts.length} posts</h3>
                                </div>
                                <div className="card flex flex-wrap items-center gap-2">
                                    <select
                                        className="input max-w-xs"
                                        value={sharePlatform}
                                        onChange={(e) => setSharePlatform(e.target.value)}
                                    >
                                        <option value="all">All Connected Platforms</option>
                                        {connectedPlatforms.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="btn btn-primary inline-flex items-center"
                                        onClick={shareAllGenerated}
                                        disabled={!generatedPosts.length || shareBulkMutation.isPending}
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share All Generated Posts
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary inline-flex items-center"
                                        onClick={publishAllGenerated}
                                        disabled={!generatedPosts.length || publishBulkMutation.isPending}
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Publish All Generated Posts
                                    </button>
                                </div>

                                {saveError && <div className="card border-red-200 bg-red-50 text-red-700">{saveError}</div>}
                                {shareMessage && <div className="card border-green-200 bg-green-50 text-green-700">{shareMessage}</div>}
                                {shareError && <div className="card border-red-200 bg-red-50 text-red-700">{shareError}</div>}
                                {publishMessage && <div className="card border-green-200 bg-green-50 text-green-700">{publishMessage}</div>}
                                {publishError && <div className="card border-red-200 bg-red-50 text-red-700">{publishError}</div>}

                                {generatedPosts.map((post, index) => (
                                    <div key={post.id ?? index} className="card hover:shadow-md transition-shadow">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-500">{post.content_type}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {editingId === post.id ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => saveEdit(post.id)}
                                                            className="btn btn-primary inline-flex items-center"
                                                            disabled={!editText.trim()}
                                                        >
                                                            <Save className="mr-2 h-4 w-4" />
                                                            Save
                                                        </button>
                                                        <button type="button" onClick={cancelEdit} className="btn btn-secondary inline-flex items-center">
                                                            <X className="mr-2 h-4 w-4" />
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button type="button" onClick={() => startEdit(post)} className="btn btn-secondary inline-flex items-center">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </button>
                                                )}
                                                <button type="button" onClick={() => copyToClipboard(post.content, index)} className="text-gray-400 hover:text-gray-600">
                                                    {copiedId === index ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => shareOne(post.id)}
                                                    className="btn btn-secondary inline-flex items-center"
                                                >
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    Share
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => publishOne(post.id)}
                                                    className="btn btn-secondary inline-flex items-center"
                                                >
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    Publish
                                                </button>
                                            </div>
                                        </div>

                                        {editingId === post.id ? (
                                            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="input min-h-[140px] w-full mb-4" />
                                        ) : (
                                            <div className="mb-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-gray-900">{post.content}</div>
                                        )}

                                        {(post.caption || editingId === post.id) && (
                                            <div className="mb-4">
                                                <h4 className="mb-2 text-sm font-semibold text-gray-700">Caption:</h4>
                                                {editingId === post.id ? (
                                                    <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="input min-h-[80px] w-full" />
                                                ) : (
                                                    <div className="whitespace-pre-wrap rounded-lg bg-blue-50 p-3 text-sm text-gray-900">{post.caption}</div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <h4 className="mb-2 text-sm font-semibold text-gray-700">Hashtags:</h4>
                                            {editingId === post.id ? (
                                                <input value={editHashtags} onChange={(e) => setEditHashtags(e.target.value)} className="input w-full" placeholder="tag1, tag2, tag3" />
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {(post.hashtags || []).map((tag, i) => (
                                                        <span key={i} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">#{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {post.design_url && (
                                            <div>
                                                <h4 className="mb-2 text-sm font-semibold text-gray-700">Generated Image:</h4>
                                                <img
                                                    src={`${BACKEND_BASE}/${post.design_url.replace(/^\.?\//, '')}`}
                                                    alt="Generated design"
                                                    className="max-w-sm rounded-lg border border-gray-200"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!generateMutation.isPending && !generateMutation.isSuccess && !generateMutation.isError && (
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
