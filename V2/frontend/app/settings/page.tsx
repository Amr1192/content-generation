'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Settings as SettingsIcon, User, Bell, Palette, Shield, Share2, Link2, Unlink } from 'lucide-react'
import { socialApi } from '@/lib/api'

export default function SettingsPage() {
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState('profile')

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && ['profile', 'notifications', 'preferences', 'social', 'security'].includes(tab)) {
            setActiveTab(tab)
        }
    }, [searchParams])

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'preferences', name: 'Preferences', icon: Palette },
        { id: 'social', name: 'Social', icon: Share2 },
        { id: 'security', name: 'Security', icon: Shield },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="card p-2">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <tab.icon className="h-5 w-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="card">
                            {activeTab === 'profile' && <ProfileSettings />}
                            {activeTab === 'notifications' && <NotificationSettings />}
                            {activeTab === 'preferences' && <PreferenceSettings />}
                            {activeTab === 'social' && <SocialSettings />}
                            {activeTab === 'security' && <SecuritySettings />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SocialSettings() {
    const queryClient = useQueryClient()
    const [oauthMessage, setOauthMessage] = useState('')
    const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)

    const platformMeta: Record<string, { label: string; oauthHint: string }> = {
        instagram: { label: 'Instagram', oauthHint: 'Meta app + Instagram Business permissions required' },
        facebook: { label: 'Facebook', oauthHint: 'Meta app with pages permissions required' },
        twitter: { label: 'Twitter/X', oauthHint: 'X app with OAuth 2.0 enabled' },
        linkedin: { label: 'LinkedIn', oauthHint: 'LinkedIn app with Sign In + Share scopes' },
        tiktok: { label: 'TikTok', oauthHint: 'TikTok developer app with video.publish scope' },
    }

    const platformsQuery = useQuery({
        queryKey: ['social-platforms'],
        queryFn: socialApi.getPlatforms,
    })

    const accountsQuery = useQuery({
        queryKey: ['social-accounts'],
        queryFn: socialApi.getAccounts,
    })

    const oauthMutation = useMutation({
        mutationFn: (platform: string) => socialApi.startOAuth(platform),
        onMutate: (platform: string) => {
            setOauthMessage('')
            setConnectingPlatform(platform)
        },
        onSuccess: (data: any) => {
            const win = window.open(data.auth_url, '_blank', 'noopener,noreferrer,width=720,height=780')
            if (!win) {
                setOauthMessage('Pop-up was blocked. Please allow pop-ups and try again.')
                return
            }
            const timer = window.setInterval(() => {
                queryClient.invalidateQueries({ queryKey: ['social-accounts'] })
                if (win.closed) window.clearInterval(timer)
            }, 1500)
        },
        onError: (err: any) => {
            const detail = err?.userMessage || err?.response?.data?.detail || ''
            if (String(detail).toLowerCase().includes('is not configured')) {
                setOauthMessage(
                    'This sign-in button will work after app setup is completed in backend/.env. You do not need to paste tokens manually.'
                )
                return
            }
            setOauthMessage(detail || 'Sign-in could not start. Please try again.')
        },
        onSettled: () => {
            setConnectingPlatform(null)
        },
    })

    const disconnectMutation = useMutation({
        mutationFn: socialApi.disconnectAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['social-accounts'] })
        },
    })

    const oauthSupported: string[] =
        platformsQuery.data?.oauth_supported_platforms ||
        ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok']
    const connectedSet = new Set((accountsQuery.data || []).map((acc: any) => acc.platform))

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Connect Social Accounts</h2>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold mb-2">Sign In Flow (Like “Continue with Google”)</p>
                <p className="mb-1">1. Click <strong>Continue with Facebook/Instagram/X/LinkedIn/TikTok</strong>.</p>
                <p className="mb-1">2. A sign-in window opens. Log in and approve access.</p>
                <p className="mb-1">3. Come back and your connected account appears below.</p>
                <p className="mt-2">You should never paste passwords/tokens here manually.</p>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {oauthSupported.map((platform) => {
                    const meta = platformMeta[platform] || {
                        label: platform,
                        oauthHint: 'OAuth app credentials required in backend/.env',
                    }
                    const isConnected = connectedSet.has(platform)
                    const isThisPending = connectingPlatform === platform && oauthMutation.isPending
                    return (
                        <div key={platform} className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-semibold text-gray-900">{meta.label}</p>
                                {isConnected && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                        Connected
                                    </span>
                                )}
                            </div>
                            <p className="mb-3 text-xs text-gray-600">{meta.oauthHint}</p>
                            <button
                                type="button"
                                className="btn btn-primary inline-flex items-center"
                                onClick={() => oauthMutation.mutate(platform)}
                                disabled={oauthMutation.isPending}
                            >
                                <Link2 className="mr-2 h-4 w-4" />
                                {isThisPending ? 'Opening sign-in...' : `Continue with ${meta.label}`}
                            </button>
                        </div>
                    )
                })}
            </div>

            {oauthMessage && <p className="mb-4 text-sm text-red-700">{oauthMessage}</p>}

            {accountsQuery.isPending && <p className="text-gray-600">Loading connected platforms...</p>}

            {accountsQuery.data && accountsQuery.data.length === 0 && (
                <p className="text-gray-600">No OAuth-connected platforms yet.</p>
            )}

            {accountsQuery.data && accountsQuery.data.length > 0 && (
                <div className="space-y-3">
                    {accountsQuery.data.map((acc: any) => (
                        <div key={acc.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">{acc.platform}</p>
                                <p className="text-sm text-gray-600">{acc.account_handle || 'Connected'}</p>
                            </div>
                            <button
                                className="btn btn-secondary inline-flex items-center"
                                onClick={() => disconnectMutation.mutate(acc.platform)}
                                disabled={disconnectMutation.isPending}
                            >
                                <Unlink className="mr-2 h-4 w-4" />
                                Disconnect
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function ProfileSettings() {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" className="input" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" className="input" placeholder="john@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea className="input min-h-[100px]" placeholder="Tell us about yourself..." />
                </div>
                <button className="btn btn-primary">Save Changes</button>
            </div>
        </div>
    )
}

function NotificationSettings() {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
                <SettingToggle title="Email Notifications" description="Receive email updates about your content" />
                <SettingToggle title="Content Ready Alerts" description="Get notified when your content is generated" />
                <SettingToggle title="Weekly Summary" description="Receive a weekly summary of your activity" />
            </div>
        </div>
    )
}

function PreferenceSettings() {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Content Preferences</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Platform</label>
                    <select className="input">
                        <option>Instagram</option>
                        <option>Facebook</option>
                        <option>Twitter/X</option>
                        <option>LinkedIn</option>
                        <option>TikTok</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Tone</label>
                    <select className="input">
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Funny</option>
                        <option>Inspirational</option>
                    </select>
                </div>
                <button className="btn btn-primary">Save Preferences</button>
            </div>
        </div>
    )
}

function SecuritySettings() {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input type="password" className="input" placeholder="********" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input type="password" className="input" placeholder="********" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input type="password" className="input" placeholder="********" />
                </div>
                <button className="btn btn-primary">Update Password</button>
            </div>
        </div>
    )
}

function SettingToggle({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
        </div>
    )
}
