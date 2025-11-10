// File: page.tsx
// Path: /src/app/community/page.tsx
// Community page - browse members

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CommunityPage() {
  // TODO: Fetch users from database with filters
  // For now, using placeholder data

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-custom py-12">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Community
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Connect with producers, musicians, and creatives from around the world
            </p>
          </div>

          {/* Filters & Search */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search members..."
                  className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              <button className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Members Grid - Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 hover:shadow-xl transition-shadow">
                {/* Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      Member {i}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @username{i}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                  Music producer and audio engineer specializing in hip-hop and electronic music.
                </p>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                    Producer
                  </span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                    Musician
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>127 followers</span>
                  <span>•</span>
                  <span>23 products</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 btn-primary py-2 text-sm">
                    Follow
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}