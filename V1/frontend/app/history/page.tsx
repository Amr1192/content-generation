import { History, Search } from 'lucide-react'

export default function HistoryPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Content History</h1>
                    <p className="mt-2 text-gray-600">
                        View and manage all your previously generated content
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your content..."
                            className="input pl-10 w-full max-w-md"
                        />
                    </div>
                </div>

                {/* Empty State */}
                <div className="card text-center py-16">
                    <History className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
                    <p className="text-gray-600 mb-6">
                        Your generated content will appear here once you start creating
                    </p>
                    <a href="/generate" className="btn btn-primary inline-flex items-center">
                        Generate Your First Content
                    </a>
                </div>
            </div>
        </div>
    )
}
