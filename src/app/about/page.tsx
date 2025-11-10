// File: page.tsx
// Path: /src/app/about/page.tsx
// About page

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <Header />
      
      <main className="bg-white dark:bg-gray-950">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
          <div className="container-custom text-center">
            <h1 className="text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              About Producers Avenue
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The ultimate platform where music creators connect, collaborate, and thrive together
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-6 text-center">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                [PLACEHOLDER: Mission statement - What Producers Avenue is trying to achieve]
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                [PLACEHOLDER: Core values and vision for the music community]
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                [PLACEHOLDER: How we're different from other platforms]
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container-custom">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-12 text-center">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Feature 1 */}
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                  Connect
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Network with producers, musicians, and creatives from around the world
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                  Marketplace
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Buy and sell beats, samples, services, and more in our thriving marketplace
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                  Tools
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access powerful collaboration tools and project management features
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
              <div>
                <div className="text-4xl font-heading font-bold text-primary mb-2">
                  10K+
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Active Creators
                </div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold text-primary mb-2">
                  50K+
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Products & Services
                </div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold text-primary mb-2">
                  100K+
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Collaborations
                </div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold text-primary mb-2">
                  $1M+
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Creator Earnings
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-heading font-bold mb-6">
              Ready to Join?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Start connecting with music creators and grow your career today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Get Started Free
              </Link>
              <Link href="/pricing" className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}