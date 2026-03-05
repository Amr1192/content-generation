'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { History, Search, Loader2, Pencil, Save, X, Share2 } from 'lucide-react'
import { contentApi, socialApi } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const BACKEND_BASE = API_BASE.replace(/\/api\/v1\/?$/, '')

type HistoryItem = {
    id: number
    content_type: string
    platform: string
    generated_text: string
    caption?: string | null
    hashtags?: string[] | null
    design_url?: string | null
    created_at: string
}

const getErrorMessage = (err: any, fallback: string): string => {
    const raw = err?.userMessage ?? err?.response?.data?.detail ?? err?.message
    if (typeof raw === 'string' && raw.trim()) return raw

    if (Array.isArray(raw)) {
        const messages = raw
            .map((item: any) => {
                if (typeof item === 'string') return item
                if (typeof item?.msg === 'string') return item.msg
                try {
                    return JSON.stringify(item)
                } catch {
                    return ''
                }
            })
            .filter(Boolean)
        if (messages.length) return messages.join(' | ')
    }

    if (raw && typeof raw === 'object') {
        if (typeof raw.msg === 'string' && raw.msg.trim()) return raw.msg
        try {
            return JSON.stringify(raw)
        } catch {
            return fallback
        }
    }

    return fallback
}

export default function HistoryPage() {
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editText, setEditText] = useState('')
    const [editCaption, setEditCaption] = useState('')
    const [editHashtags, setEditHashtags] = useState('')
    const [bulkPlatform, setBulkPlatform] = useState('all')
    const [shareMessage, setShareMessage] = useState('')
    const [shareError, setShareError] = useState('')
    const [publishMessage, setPublishMessage] = useState('')
    const [publishError, setPublishError] = useState('')
    const queryClient = useQueryClient()

    const historyQuery = useQuery({
        queryKey: ['history-content'],
        queryFn: () => contentApi.getAll({ limit: 100 }),
    })

    const items: HistoryItem[] = historyQuery.data ?? []
    const accountsQuery = useQuery({
        queryKey: ['social-accounts'],
        queryFn: socialApi.getAccounts,
    })

    const updateMutation = useMutation({
        mutationFn: (payload: {
            id: number
            generated_text: string
            caption: string
            hashtags: string[]
        }) =>
            contentApi.update(payload.id, {
                generated_text: payload.generated_text,
                caption: payload.caption,
                hashtags: payload.hashtags,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history-content'] })
            setEditingId(null)
        },
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
            setShareError(getErrorMessage(err, 'Share failed. Connect a platform in Settings > Social first.'))
        },
    })

    const shareBulkMutation = useMutation({
        mutationFn: (payload: { content_ids?: number[]; platforms?: string[] }) =>
            socialApi.shareBulk(payload),
        onSuccess: (data: any) => {
            setShareError('')
            let sawManual = false
            for (const item of data.items || []) {
                const msg = summarizeAndOpenShareLinks(item.share_links)
                if (msg.includes('Manual share required')) sawManual = true
            }
            setShareMessage(`Prepared share links for ${data.count} posts.${sawManual ? ' Some platforms require manual posting.' : ''}`)
        },
        onError: (err: any) => {
            const detailMessage = getErrorMessage(err, 'Bulk share failed. Connect a platform in Settings > Social first.')
            if (detailMessage.toLowerCase().includes('no connected social platforms')) {
                setShareError('')
                setShareMessage('No social accounts connected yet. Go to Settings > Social and connect at least one platform.')
                return
            }
            setShareMessage('')
            setShareError(detailMessage)
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
            setPublishError(getErrorMessage(err, 'Publish failed.'))
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
            setPublishError(getErrorMessage(err, 'Bulk publish failed.'))
        },
    })

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return items

        return items.filter((item) => {
            const hashtags = (item.hashtags ?? []).join(' ').toLowerCase()
            return (
                item.generated_text.toLowerCase().includes(q) ||
                (item.caption ?? '').toLowerCase().includes(q) ||
                hashtags.includes(q) ||
                item.platform.toLowerCase().includes(q) ||
                item.content_type.toLowerCase().includes(q)
            )
        })
    }, [items, search])

    const startEdit = (item: HistoryItem) => {
        setEditingId(item.id)
        setEditText(item.generated_text ?? '')
        setEditCaption(item.caption ?? '')
        setEditHashtags((item.hashtags ?? []).join(', '))
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditText('')
        setEditCaption('')
        setEditHashtags('')
    }

    const saveEdit = (itemId: number) => {
        const tags = editHashtags
            .split(',')
            .map((t) => t.trim().replace(/^#/, ''))
            .filter(Boolean)
        updateMutation.mutate({
            id: itemId,
            generated_text: editText,
            caption: editCaption,
            hashtags: tags,
        })
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

    const shareOne = (contentId: number, platform: string) => {
        const platforms = platform === 'all' ? undefined : [platform]
        publishPostMutation.mutate(
            { contentId, platforms },
            {
                onError: () => {
                    sharePostMutation.mutate({ contentId, platforms })
                },
            }
        )
    }

    const shareAllVisible = () => {
        const ids = filteredItems.map((i) => i.id)
        if (ids.length === 0) return
        const platforms = bulkPlatform === 'all' ? undefined : [bulkPlatform]
        publishBulkMutation.mutate(
            { content_ids: ids, platforms },
            {
                onError: () => {
                    shareBulkMutation.mutate({ content_ids: ids, platforms })
                },
            }
        )
    }

    const publishOne = (contentId: number, platform: string) => {
        const platforms = platform === 'all' ? undefined : [platform]
        publishPostMutation.mutate({ contentId, platforms })
    }

    const publishAllVisible = () => {
        const ids = filteredItems.map((i) => i.id)
        if (ids.length === 0) return
        const platforms = bulkPlatform === 'all' ? undefined : [bulkPlatform]
        publishBulkMutation.mutate({ content_ids: ids, platforms })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Content History</h1>
                    <p className="mt-2 text-gray-600">
                        View and manage all your previously generated content
                    </p>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search your content..."
                            className="input pl-10 w-full max-w-md"
                        />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <select
                            className="input max-w-xs"
                            value={bulkPlatform}
                            onChange={(e) => setBulkPlatform(e.target.value)}
                        >
                            <option value="all">All Connected Platforms</option>
                            {connectedPlatforms.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <button
                            className="btn btn-primary inline-flex items-center"
                            onClick={shareAllVisible}
                            disabled={shareBulkMutation.isPending || filteredItems.length === 0}
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share All Visible Posts
                        </button>
                        <button
                            className="btn btn-secondary inline-flex items-center"
                            onClick={publishAllVisible}
                            disabled={publishBulkMutation.isPending || filteredItems.length === 0}
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Publish All Visible Posts
                        </button>
                    </div>
                    {shareMessage && (
                        <p className="mt-2 text-sm text-green-700">{shareMessage}</p>
                    )}
                    {shareError && (
                        <p className="mt-2 text-sm text-red-700">{shareError}</p>
                    )}
                    {publishMessage && (
                        <p className="mt-2 text-sm text-green-700">{publishMessage}</p>
                    )}
                    {publishError && (
                        <p className="mt-2 text-sm text-red-700">{publishError}</p>
                    )}
                </div>

                {historyQuery.isPending && (
                    <div className="card text-center py-16">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-500" />
                        <p className="text-gray-600">Loading your content...</p>
                    </div>
                )}

                {historyQuery.isError && (
                    <div className="card border-red-200 bg-red-50">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Could not load history</h3>
                        <p className="text-red-700">
                            {(historyQuery.error as any)?.userMessage ||
                                (historyQuery.error as any)?.message ||
                                'Failed to load content history.'}
                        </p>
                    </div>
                )}

                {!historyQuery.isPending && !historyQuery.isError && filteredItems.length === 0 && (
                    <div className="card text-center py-16">
                        <History className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
                        <p className="text-gray-600 mb-6">
                            Your generated content will appear here once you start creating
                        </p>
                        <Link href="/generate" className="btn btn-primary inline-flex items-center">
                            Generate Your First Content
                        </Link>
                    </div>
                )}

                {!historyQuery.isPending && !historyQuery.isError && filteredItems.length > 0 && (
                    <div className="space-y-4">
                        {filteredItems.map((item) => (
                            <article key={item.id} className="card">
                                <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-700 font-medium">
                                        {item.content_type}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                        {item.platform}
                                    </span>
                                    <span className="text-gray-500">
                                        {new Date(item.created_at).toLocaleString()}
                                    </span>
                                    <div className="ml-auto">
                                        {editingId === item.id ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => saveEdit(item.id)}
                                                    className="btn btn-primary inline-flex items-center"
                                                    disabled={updateMutation.isPending}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="btn btn-secondary inline-flex items-center"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    className="btn btn-secondary inline-flex items-center"
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </button>
                                                <select
                                                    className="input max-w-[180px]"
                                                    defaultValue="all"
                                                    onChange={(e) => {
                                                        shareOne(item.id, e.target.value)
                                                        e.currentTarget.value = 'all'
                                                    }}
                                                >
                                                    <option value="all">Share...</option>
                                                    <option value="all">All Connected</option>
                                                    {connectedPlatforms.map((p) => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="btn btn-secondary inline-flex items-center"
                                                    onClick={() => publishOne(item.id, 'all')}
                                                >
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    Publish
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {editingId === item.id ? (
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="input min-h-[140px] w-full"
                                    />
                                ) : (
                                    <p className="whitespace-pre-wrap text-gray-900">{item.generated_text}</p>
                                )}

                                {(item.caption || editingId === item.id) && (
                                    <div className="mt-3 rounded-lg bg-blue-50 p-3">
                                        <p className="text-sm font-medium text-blue-800 mb-1">Caption</p>
                                        {editingId === item.id ? (
                                            <textarea
                                                value={editCaption}
                                                onChange={(e) => setEditCaption(e.target.value)}
                                                className="input min-h-[80px] w-full"
                                            />
                                        ) : (
                                            <p className="whitespace-pre-wrap text-sm text-gray-800">{item.caption}</p>
                                        )}
                                    </div>
                                )}

                                <div className="mt-3">
                                    <p className="mb-2 text-sm font-medium text-gray-700">Hashtags</p>
                                    {editingId === item.id ? (
                                        <input
                                            value={editHashtags}
                                            onChange={(e) => setEditHashtags(e.target.value)}
                                            className="input w-full"
                                            placeholder="tag1, tag2, tag3"
                                        />
                                    ) : item.hashtags && item.hashtags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {item.hashtags.map((tag, i) => (
                                                <span key={`${item.id}-${i}`} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No hashtags</p>
                                    )}
                                </div>

                                {item.design_url && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-sm font-medium text-gray-700">Generated Image</p>
                                        <img
                                            src={`${BACKEND_BASE}/${item.design_url.replace(/^\.?\//, '')}`}
                                            alt="Generated design"
                                            className="max-w-sm rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
