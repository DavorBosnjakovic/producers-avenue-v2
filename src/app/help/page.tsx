// File: page.tsx
// Path: /src/app/help/page.tsx
// Help/FAQ page

'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click the "Sign Up" button in the top right corner and fill out the registration form. You can sign up with your email or use Google/GitHub OAuth for quick registration.',
  },
  {
    category: 'Getting Started',
    question: 'How do I verify my email address?',
    answer: 'After registering, check your email inbox for a verification link. Click the link to verify your email. If you don\'t see the email, check your spam folder or request a new verification email from your account settings.',
  },
  {
    category: 'Getting Started',
    question: 'What can I do on Producers Avenue?',
    answer: 'Producers Avenue is a marketplace for digital products and services. You can buy and sell beats, samples, plugins, templates, mixing/mastering services, and more. Connect with other producers, collaborate, and grow your music production business.',
  },

  // Selling
  {
    category: 'Selling',
    question: 'How do I list a product for sale?',
    answer: 'Navigate to "Add Product" from your dashboard. Fill in the product details including title, description, price, category, and upload your files. Your product will be live once you submit it.',
  },
  {
    category: 'Selling',
    question: 'How do I list a service?',
    answer: 'Go to "Add Service" from your dashboard. Provide service details including what you offer, pricing, delivery time, and portfolio examples. Your service listing will be available immediately after submission.',
  },
  {
    category: 'Selling',
    question: 'What file formats can I upload?',
    answer: 'For products, you can upload ZIP files, PDF documents, audio files (WAV, MP3), and more. Maximum file size is 100MB. For images, we accept JPG, PNG, GIF, and WebP up to 5MB each.',
  },
  {
    category: 'Selling',
    question: 'How much does it cost to sell?',
    answer: 'Listing products and services is free. We take a small commission on each sale to maintain the platform. Check our pricing page for current commission rates.',
  },
  {
    category: 'Selling',
    question: 'How do I edit or delete my listings?',
    answer: 'Go to "My Listings" in your dashboard. From there, you can edit or delete any of your products or services. Note that deleting a listing is permanent and cannot be undone.',
  },

  // Buying
  {
    category: 'Buying',
    question: 'How do I purchase a product?',
    answer: 'Find the product you want, click on it to view details, then click "Buy Now" or "Add to Cart". Follow the checkout process to complete your purchase. You\'ll receive the download link immediately after payment.',
  },
  {
    category: 'Buying',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets through our secure payment processor Stripe.',
  },
  {
    category: 'Buying',
    question: 'How do I download my purchased products?',
    answer: 'After purchase, go to "Orders" in your dashboard. Find your order and click the download button. Download links are available indefinitely, so you can re-download if needed.',
  },
  {
    category: 'Buying',
    question: 'Can I get a refund?',
    answer: 'Refunds are handled on a case-by-case basis. If you\'re unsatisfied with a purchase, contact the seller first. If you can\'t resolve the issue, contact our support team within 7 days of purchase.',
  },

  // Payments
  {
    category: 'Payments',
    question: 'When will I receive my earnings?',
    answer: 'Earnings from sales are held for 7 days to prevent fraud and chargebacks. After that, you can withdraw your funds to your connected bank account or PayPal.',
  },
  {
    category: 'Payments',
    question: 'How do I withdraw my earnings?',
    answer: 'Go to your "Wallet" in the dashboard. Click "Withdraw" and follow the instructions to transfer funds to your linked bank account or PayPal. Minimum withdrawal amount is $10.',
  },
  {
    category: 'Payments',
    question: 'Are there any fees for withdrawing money?',
    answer: 'Standard withdrawals are free. However, instant withdrawals (if available) may have a small fee. Your payment processor may also charge fees on their end.',
  },

  // Account & Security
  {
    category: 'Account & Security',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link. Follow the link to create a new password.',
  },
  {
    category: 'Account & Security',
    question: 'How do I change my username?',
    answer: 'Go to "Settings" and navigate to the "Profile" tab. You can update your username there. Note that your username must be unique and can only be changed once every 30 days.',
  },
  {
    category: 'Account & Security',
    question: 'Is my information secure?',
    answer: 'Yes. We use industry-standard encryption and security measures to protect your data. Payment information is processed by Stripe and never stored on our servers. We never share your personal information with third parties.',
  },
  {
    category: 'Account & Security',
    question: 'How do I delete my account?',
    answer: 'Go to "Settings" and navigate to the "Account" tab. Scroll down to find the "Delete Account" option. Please note that deleting your account is permanent and all your data will be removed.',
  },

  // Community
  {
    category: 'Community',
    question: 'How do I message other users?',
    answer: 'Click on a user\'s profile and select "Message" to start a conversation. You can also access all your messages from the "Messages" section in your dashboard.',
  },
  {
    category: 'Community',
    question: 'Can I report inappropriate content or users?',
    answer: 'Yes. If you encounter inappropriate content or behavior, use the "Report" button on profiles or listings. Our moderation team will review and take appropriate action.',
  },
  {
    category: 'Community',
    question: 'How do reviews work?',
    answer: 'After completing a purchase, you can leave a review for the seller and their product/service. Reviews help build trust in the community and help other buyers make informed decisions.',
  },

  // Technical Support
  {
    category: 'Technical Support',
    question: 'I\'m having trouble uploading files. What should I do?',
    answer: 'Make sure your file doesn\'t exceed the size limit (100MB for products, 5MB for images). Check that you\'re using a supported file format. If problems persist, try clearing your browser cache or using a different browser.',
  },
  {
    category: 'Technical Support',
    question: 'The website isn\'t working properly. What should I do?',
    answer: 'Try refreshing the page or clearing your browser cache. Make sure you\'re using an up-to-date browser (Chrome, Firefox, Safari, or Edge). If issues continue, contact our support team with details about the problem.',
  },
  {
    category: 'Technical Support',
    question: 'How do I contact customer support?',
    answer: 'You can reach our support team through the contact form on our Contact page, or email us directly at support@producersavenue.com. We typically respond within 24 hours.',
  },
]

const categories = Array.from(new Set(faqs.map((faq) => faq.category)))

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedQuestions(newExpanded)
  }

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-lg text-gray-600 mb-8">
            Search our FAQs or browse by category
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full px-6 py-4 pl-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent text-lg"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-[#FF6B2C] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Questions ({faqs.length})
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#FF6B2C] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category} ({faqs.filter((f) => f.category === category).length})
                  </button>
                ))}
              </div>

              {/* Contact Support */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Still need help?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Can't find what you're looking for? Contact our support team.
                </p>
                <Link
                  href="/contact"
                  className="block w-full text-center px-4 py-2 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content - FAQs */}
          <div className="lg:col-span-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or browse all categories
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                  }}
                  className="text-[#FF6B2C] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => {
                  const isExpanded = expandedQuestions.has(index)
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(index)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex-1">
                          <div className="text-xs text-[#FF6B2C] font-medium mb-1">
                            {faq.category}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {faq.question}
                          </h3>
                        </div>
                        <svg
                          className={`w-6 h-6 text-gray-400 flex-shrink-0 ml-4 transition-transform ${
                            isExpanded ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-6 pb-4 text-gray-700 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}