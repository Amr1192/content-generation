'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Palette, Shield } from 'lucide-react'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'preferences', name: 'Preferences', icon: Palette },
        { id: 'security', name: 'Security', icon: Shield },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-2">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <tab.icon className="h-5 w-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="card">
                            {activeTab === 'profile' && <ProfileSettings />}
                            {activeTab === 'notifications' && <NotificationSettings />}
                            {activeTab === 'preferences' && <PreferenceSettings />}
                            {activeTab === 'security' && <SecuritySettings />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProfileSettings() {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                    </label>
                    <input type="text" className="input" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input type="email" className="input" placeholder="john@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                    </label>
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
                <SettingToggle
                    title="Email Notifications"
                    description="Receive email updates about your content"
                />
                <SettingToggle
                    title="Content Ready Alerts"
                    description="Get notified when your content is generated"
                />
                <SettingToggle
                    title="Weekly Summary"
                    description="Receive a weekly summary of your activity"
                />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Platform
                    </label>
                    <select className="input">
                        <option>Instagram</option>
                        <option>Facebook</option>
                        <option>Twitter/X</option>
                        <option>LinkedIn</option>
                        <option>TikTok</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Tone
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                    </label>
                    <input type="password" className="input" placeholder="••••••••" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <input type="password" className="input" placeholder="••••••••" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <input type="password" className="input" placeholder="••••••••" />
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
