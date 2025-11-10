// File: page.tsx
// Path: /src/app/(protected)/services/new/page.tsx
// Create new service page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const CATEGORIES = [
  'Mixing',
  'Mastering',
  'Production',
  'Recording',
  'Songwriting',
  'Vocals',
  'Session Musician',
  'Beat Making',
  'Sound Design',
  'Consultation',
  'Other'
]

const DELIVERY_TIMES = [
  '24 hours',
  '2-3 days',
  '4-7 days',
  '1-2 weeks',
  '2-4 weeks',
  'Custom'
]

export default function NewServicePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Mixing',
    price: '',
    delivery_time: '2-3 days',
    revisions: '2',
    tags: '',
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }

    setImages([...images, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + portfolioFiles.length > 5) {
      setError('Maximum 5 portfolio files allowed')
      return
    }

    // Check file sizes (max 50MB each)
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Portfolio files must be less than 50MB each')
        return
      }
    }

    setPortfolioFiles([...portfolioFiles, ...files])
  }

  const removePortfolioFile = (index: number) => {
    setPortfolioFiles(portfolioFiles.filter((_, i) => i !== index))
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Validate required fields
      if (!formData.title || !formData.description || !formData.price) {
        throw new Error('Please fill in all required fields')
      }

      // Upload images
      const imageUrls: string[] = []
      for (let i = 0; i < images.length; i++) {
        const path = `services/${user.id}/${Date.now()}_${i}_${images[i].name}`
        const url = await uploadFile(images[i], 'service-images', path)
        imageUrls.push(url)
      }

      // Upload portfolio files
      const portfolioUrls: string[] = []
      for (let i = 0; i < portfolioFiles.length; i++) {
        const path = `portfolios/${user.id}/${Date.now()}_${i}_${portfolioFiles[i].name}`
        const url = await uploadFile(portfolioFiles[i], 'service-portfolios', path)
        portfolioUrls.push(url)
      }

      // Create service
      const { data: service, error: insertError } = await supabase
        .from('services')
        .insert({
          provider_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          delivery_time: formData.delivery_time,
          revisions: parseInt(formData.revisions),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          images: imageUrls,
          portfolio_urls: portfolioUrls,
          status: 'active',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Redirect to service page
      router.push(`/marketplace/services/${service.service_id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-favorit font-bold text-white mb-2">
            Offer a Service
          </h1>
          <p className="text-[#888888] font-inter">
            Share your expertise and help others with their music production
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm font-inter">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-favorit font-bold text-white mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2 font-inter">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Professional Mixing & Mastering"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors font-inter"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2 font-inter">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your service, your experience, what's included, your process, etc."
                  rows={8}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors resize-none font-inter"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white mb-2 font-inter">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-white transition-colors font-inter"
                    required
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-white mb-2 font-inter">
                    Starting Price (USD) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="99.99"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors font-inter"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-favorit font-bold text-white mb-4">
              Service Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="delivery_time" className="block text-sm font-medium text-white mb-2 font-inter">
                  Delivery Time *
                </label>
                <select
                  id="delivery_time"
                  name="delivery_time"
                  value={formData.delivery_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-white transition-colors font-inter"
                  required
                >
                  {DELIVERY_TIMES.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="revisions" className="block text-sm font-medium text-white mb-2 font-inter">
                  Revisions Included *
                </label>
                <input
                  type="number"
                  id="revisions"
                  name="revisions"
                  value={formData.revisions}
                  onChange={handleInputChange}
                  placeholder="2"
                  min="0"
                  max="10"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors font-inter"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="tags" className="block text-sm font-medium text-white mb-2 font-inter">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="mixing, mastering, professional, fast"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors font-inter"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-favorit font-bold text-white mb-4">
              Images
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-inter">
                  Service Images (up to 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#333333] rounded-lg cursor-pointer hover:border-[#666666] transition-colors"
                >
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="mt-2 text-sm text-[#888888] font-inter">Click to upload images</p>
                  </div>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-favorit font-bold text-white mb-4">
              Portfolio (Optional)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-inter">
                  Upload Examples of Your Work (up to 5, max 50MB each)
                </label>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  multiple
                  onChange={handlePortfolioChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1a1a1a] file:text-white hover:file:bg-[#222222] file:cursor-pointer font-inter"
                />
              </div>

              {portfolioFiles.length > 0 && (
                <div className="space-y-2">
                  {portfolioFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-[#333333]">
                      <div className="flex-1">
                        <p className="text-white text-sm font-inter">{file.name}</p>
                        <p className="text-[#666666] text-xs font-inter">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePortfolioFile(index)}
                        className="ml-4 text-red-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors border border-[#333333] font-favorit"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white hover:bg-[#eeeeee] text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-favorit font-bold"
            >
              {loading ? 'Creating...' : 'List Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}