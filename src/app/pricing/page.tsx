// File: page.tsx
// Path: /src/app/pricing/page.tsx
// Pricing page

'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Check, Info } from 'lucide-react';

export default function PricingPage() {
  const { theme } = useTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'BASIC',
      tagline: 'Start Your Journey',
      description: 'Perfect for beginners testing the platform',
      price: { monthly: 0, annual: 0 },
      savings: null,
      badge: null,
      color: theme === 'dark' ? '#666666' : '#999999',
      popular: false,
      features: [
        { text: '5 Products', included: true },
        { text: 'Unlimited Services', included: true },
        { text: 'Unlimited Webinars', included: true },
        { text: 'Up To 100MB Total Files', included: true },
        { text: '40% Commission', included: true, highlight: false },
        { text: '0 Featured Products', included: false },
        { text: 'Community Support, FAQ', included: true },
        { text: 'No Analytics Dashboard', included: false },
      ],
    },
    {
      name: 'STANDARD',
      tagline: 'Grow Your Business',
      description: 'For creators ready to sell seriously',
      price: { monthly: 9.99, annual: 99.99 },
      savings: { monthly: null, annual: 19.89 },
      badge: 'Popular',
      color: '#009ae9',
      popular: true,
      features: [
        { text: '10 Products or Services', included: true },
        { text: 'Unlimited Webinars', included: true },
        { text: 'Up To 500MB Total Files', included: true },
        { text: '30% Commission', included: true, highlight: true },
        { text: '1 Featured Product/Service', included: true },
        { text: 'Email Support', included: true },
        { text: 'Basic Analytics', included: true },
      ],
    },
    {
      name: 'PREMIUM',
      tagline: 'Scale Your Reach',
      description: 'Advanced tools for growing businesses',
      price: { monthly: 29.99, annual: 279.99 },
      savings: { monthly: null, annual: 79.89 },
      badge: 'Best Value',
      color: '#8b5cf6',
      popular: false,
      features: [
        { text: '50 Products or Services', included: true },
        { text: 'Up to 3 Webinars Hosting', included: true },
        { text: 'Up To 5 GB Total Files', included: true },
        { text: '20% Commission', included: true, highlight: true },
        { text: '3 Featured Products/Services', included: true },
        { text: 'Priority Email Support', included: true },
        { text: 'Premium Analytics', included: true },
      ],
    },
    {
      name: 'ULTIMATE',
      tagline: 'Maximum Exposure',
      description: 'Everything you need to dominate',
      price: { monthly: 99.99, annual: 899.99 },
      savings: { monthly: null, annual: 299.89 },
      badge: 'Pro',
      color: '#f59e0b',
      popular: false,
      features: [
        { text: 'Unlimited Products/Services', included: true },
        { text: 'Unlimited Webinars With Recording', included: true },
        { text: 'Up to 50GB Total Files', included: true },
        { text: '10% Commission (Lowest!)', included: true, highlight: true },
        { text: '10 Featured Products/Services', included: true },
        { text: '3 Curator Submissions/month', included: true },
        { text: "Editor's Choice Section Feature", included: true },
        { text: 'Bulk Upload', included: true },
        { text: 'Detailed Analytics With Exports', included: true },
        { text: 'Priority Support (WhatsApp)', included: true },
      ],
    },
  ];

  const featureExplanations = [
    {
      title: 'Products & Services',
      description: 'Digital products include sample packs, loop packs, presets, templates, and other downloadable content you create. Services are professional offerings like mixing, mastering, production, and consultation sessions. Each plan tier determines how many products and services you can list simultaneously on the marketplace.',
    },
    {
      title: 'Featured Products/Services',
      description: 'Featured listings receive premium placement on the homepage, category pages, and search results, significantly increasing visibility and potential sales. Standard tier features last 1 week each. You can rotate which products/services are featured at any time through your dashboard.',
    },
    {
      title: 'Total File Storage',
      description: "This is your cumulative storage limit across all uploaded products, including audio files, presets, project files, and deliverables. Files are stored on our high-speed CDN for fast global delivery. Additional storage is available if needed.",
    },
    {
      title: 'Commission Structure',
      description: "Our commission is calculated on each sale and covers payment processing, platform maintenance, CDN delivery, and customer support. The commission rate is locked in at the time of purchase, so upgrading your plan immediately reduces fees on future sales. All commissions are transparently displayed before checkout.",
    },
    {
      title: 'Webinar Hosting',
      description: 'Host live online workshops, masterclasses, or Q&A sessions directly on the platform. Premium tier supports up to 3 concurrent scheduled webinars. Ultimate tier offers unlimited hosting with automatic recording, allowing you to sell access to recordings after the live session ends. Includes screen sharing, chat, and interactive tools.',
    },
    {
      title: 'Curator Submissions',
      description: 'Ultimate members can submit up to 3 products per month for consideration by our editorial team. Selected products receive premium exposure through our platform News page and monthly newsletter, sent to thousands of subscribers. Each feature includes a direct link to your product, driving high-quality traffic and potential sales.',
    },
    {
      title: 'Analytics',
      description: 'Basic Analytics (Standard): Track views, clicks, sales, and revenue with simple charts and 7-day, 30-day, and all-time reporting. Premium Analytics (Premium): Advanced insights including traffic sources, conversion rates, geographic data, and engagement metrics with comparison views. Detailed Analytics With Exports (Ultimate): Professional-grade dashboard with real-time data, predictive insights, custom date ranges, cohort analysis, competitor benchmarking, and full CSV/PDF export capabilities.',
    },
    {
      title: 'Support Tiers',
      description: 'Community Support (Basic): Access to our community forums, comprehensive FAQ library, and helpful guides. Email Support (Standard): Direct email support with responses within 24-48 hours. Priority Email Support (Premium): Expedited email support with responses within 12-24 hours, including weekends. Priority Support via WhatsApp (Ultimate): Direct WhatsApp line to our support team for immediate assistance. Average response time under 4 hours, 24/7 availability.',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Choose Your Plan
          </h1>
          <p 
            className="text-lg mb-8"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            Start free and upgrade as you grow. Save up to 3 months with annual billing.
          </p>

          {/* Billing Toggle */}
          <div 
            className="inline-flex items-center rounded-xl p-1"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
            }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: billingCycle === 'monthly' ? '#009ae9' : 'transparent',
                color: billingCycle === 'monthly' ? 'white' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                fontFamily: 'var(--font-body)',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: billingCycle === 'annual' ? '#009ae9' : 'transparent',
                color: billingCycle === 'annual' ? 'white' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                fontFamily: 'var(--font-body)',
              }}
            >
              Annual
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: billingCycle === 'annual' ? 'rgba(255,255,255,0.2)' : '#10b981',
                  color: billingCycle === 'annual' ? 'white' : 'white',
                }}
              >
                Save up to $299
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const displayPrice = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
            const monthlyCost = billingCycle === 'annual' && plan.price.annual > 0 
              ? (plan.price.annual / 12).toFixed(2) 
              : plan.price.monthly;

            return (
              <div
                key={plan.name}
                className="rounded-xl border backdrop-blur-md relative overflow-hidden transition-all hover:scale-105"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: plan.popular ? plan.color : theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  borderWidth: plan.popular ? '2px' : '1px',
                  boxShadow: plan.popular 
                    ? `0 0 30px ${plan.color}40` 
                    : theme === 'dark' 
                      ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
                      : '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: plan.color,
                      color: 'white',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Name */}
                  <h3
                    className="text-2xl font-bold mb-1"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {plan.name}
                  </h3>

                  {/* Tagline */}
                  <p
                    className="text-sm mb-2"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: plan.color,
                    }}
                  >
                    {plan.tagline}
                  </p>

                  {/* Description */}
                  <p
                    className="text-sm mb-6"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-4xl font-bold"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        }}
                      >
                        ${displayPrice}
                      </span>
                      {displayPrice > 0 && (
                        <span
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#b3b3b3' : '#666666',
                          }}
                        >
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>

                    {billingCycle === 'annual' && plan.savings?.annual && (
                      <div className="mt-2">
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#b3b3b3' : '#666666',
                          }}
                        >
                          ${monthlyCost}/month
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: '#10b981',
                          }}
                        >
                          Save ${plan.savings.annual} ({Math.round((plan.savings.annual / (plan.price.monthly * 12)) * 100)}% off)
                        </p>
                      </div>
                    )}

                    {displayPrice === 0 && (
                      <p
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: theme === 'dark' ? '#b3b3b3' : '#666666',
                        }}
                      >
                        Free forever
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    className="w-full py-3 rounded-lg font-semibold transition-all mb-6"
                    style={{
                      backgroundColor: plan.popular ? plan.color : theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                      color: plan.popular ? 'white' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                      border: plan.popular ? 'none' : `1px solid ${theme === 'dark' ? '#3a3a3a' : '#d0d0d0'}`,
                    }}
                  >
                    {displayPrice === 0 ? 'Get Started Free' : 'Start 14-Day Free Trial'}
                  </button>

                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                          style={{
                            backgroundColor: feature.included 
                              ? `${plan.color}20` 
                              : theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                          }}
                        >
                          {feature.included ? (
                            <Check size={12} style={{ color: plan.color }} />
                          ) : (
                            <span style={{ color: theme === 'dark' ? '#666666' : '#999999' }}>×</span>
                          )}
                        </div>
                        <span
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: feature.included 
                              ? theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                              : theme === 'dark' ? '#666666' : '#999999',
                            fontWeight: feature.highlight ? '600' : '400',
                            textDecoration: !feature.included ? 'line-through' : 'none',
                          }}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Explanations Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Feature Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureExplanations.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border p-6 backdrop-blur-md"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Info size={20} style={{ color: '#009ae9', marginTop: '2px' }} />
                  <h3
                    className="text-lg font-bold"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Comparison Table (Optional - can be added) */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Compare Plans
          </h2>

          <div
            className="rounded-xl border backdrop-blur-md overflow-x-auto"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                  }}
                >
                  <th
                    className="text-left p-4 font-semibold"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className="text-center p-4 font-semibold"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                  }}
                >
                  <td
                    className="p-4"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    Products
                  </td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>5</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>10</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>50</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Unlimited</td>
                </tr>
                <tr
                  style={{
                    borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                  }}
                >
                  <td
                    className="p-4"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    Storage
                  </td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>100MB</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>500MB</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>5GB</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>50GB</td>
                </tr>
                <tr
                  style={{
                    borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                  }}
                >
                  <td
                    className="p-4"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    Commission
                  </td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>40%</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>30%</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>20%</td>
                  <td className="text-center p-4" style={{ color: '#10b981', fontWeight: '600' }}>10%</td>
                </tr>
                <tr
                  style={{
                    borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                  }}
                >
                  <td
                    className="p-4"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    Featured Products
                  </td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#666666' : '#999999' }}>—</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>1</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>3</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>10</td>
                </tr>
                <tr>
                  <td
                    className="p-4"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    Analytics
                  </td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#666666' : '#999999' }}>—</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Basic</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Premium</td>
                  <td className="text-center p-4" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Detailed + Export</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I upgrade or downgrade my plan at any time?',
                a: 'Yes! Upgrade your plan at any time to immediately access higher tier benefits. Upgrades are prorated, so you only pay the difference. Downgrades take effect at the end of your current billing cycle, allowing you to enjoy your current benefits until then.',
              },
              {
                q: 'What happens to my content if I downgrade?',
                a: 'When you downgrade to a plan with fewer product/service slots, you\'ll be asked to select which products or services you want to keep active at the end of your billing cycle. All your content and data are preserved - products you don\'t select will be unpublished but can be re-published later if you upgrade again.',
              },
              {
                q: 'How does the commission work?',
                a: 'Our commission is calculated on each sale and covers payment processing, platform maintenance, CDN delivery, and customer support. The commission rate is locked in at the time of purchase based on your subscription tier, so upgrading immediately reduces fees on future sales.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel your subscription at any time. Your access continues through the end of your paid period, then your account reverts to the free Basic plan. You can re-subscribe at any time.',
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Yes! All paid plans include a 14-day free trial. No credit card required to start. Experience all the features of your chosen plan before committing.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border p-6 backdrop-blur-md"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                }}
              >
                <h3
                  className="text-lg font-bold mb-2"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <h2
            className="text-3xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Ready to Start Selling?
          </h2>
          <p
            className="text-lg mb-8"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            Join thousands of creators already building their business on Producers Avenue
          </p>
          <button
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
            style={{
              backgroundColor: '#009ae9',
              color: 'white',
              fontFamily: 'var(--font-body)',
            }}
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}