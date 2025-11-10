// File: page.tsx
// Path: /src/app/pricing/page.tsx
// Pricing page

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function PricingPage() {
  const tiers = [
    {
      name: 'Basic',
      price: 0,
      interval: 'Forever Free',
      description: 'Perfect for getting started',
      features: [
        'Up to 3 products',
        'Unlimited services',
        '40% commission rate',
        '100MB storage',
        'Community access',
        'Direct messaging',
        'Basic support',
      ],
      cta: 'Get Started',
      href: '/register',
      popular: false,
    },
    {
      name: 'Standard',
      price: 9.99,
      interval: '/month',
      description: 'For growing creators',
      features: [
        'Up to 10 products',
        'Unlimited services',
        '30% commission rate',
        '500MB storage',
        'Priority search ranking',
        '1 featured product',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      href: '/register',
      popular: false,
    },
    {
      name: 'Premium',
      price: 24.99,
      interval: '/month',
      description: 'For serious professionals',
      features: [
        'Up to 50 products',
        'Unlimited services',
        '20% commission rate',
        '5GB storage',
        'Verified badge',
        '3 featured products',
        'Advanced analytics',
        'Custom store URL',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      href: '/register',
      popular: true,
    },
    {
      name: 'Ultimate',
      price: 99.99,
      interval: '/month',
      description: 'For top-tier creators',
      features: [
        'Unlimited products',
        'Unlimited services',
        '10% commission rate',
        '50GB storage',
        'Ultimate badge',
        '10 featured products',
        'Professional analytics',
        'Custom domain',
        'Curator review access',
        'VIP support (4hr response)',
        'Account manager',
      ],
      cta: 'Start Free Trial',
      href: '/register',
      popular: false,
    },
  ]

  return (
    <>
      <Header />
      
      <main className="bg-gray-50 dark:bg-gray-950">
        {/* Hero Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container-custom text-center">
            <h1 className="text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your music career. Start free and upgrade anytime.
            </p>
            
            {/* Toggle - Annual/Monthly */}
            <div className="inline-flex items-center gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button className="px-6 py-2 bg-white dark:bg-gray-900 rounded-lg font-semibold shadow-sm">
                Monthly
              </button>
              <button className="px-6 py-2 text-gray-600 dark:text-gray-400 font-semibold">
                Annual
                <span className="ml-2 text-xs text-primary">(Save 17%)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`card p-8 flex flex-col relative ${
                    tier.popular
                      ? 'border-2 border-primary shadow-xl scale-105'
                      : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-heading font-bold text-gray-900 dark:text-white">
                        ${tier.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        {tier.interval}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={tier.href}
                    className={`w-full py-3 text-center font-semibold rounded-lg transition-colors ${
                      tier.popular
                        ? 'bg-primary text-white hover:bg-primary-hover'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container-custom">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  What's the commission rate?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Commission rates vary by plan: Basic (40%), Standard (30%), Premium (20%), Ultimate (10%).
                </p>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer a free trial?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! All paid plans include a 14-day free trial. No credit card required to start.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  How do payouts work?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You can request a payout once you reach $50 in earnings. Payouts are processed within 3-5 business days via Stripe.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Still have questions?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Our team is here to help you choose the right plan
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}