// File: page.tsx
// Path: /src/app/(protected)/services/[id]/edit/page.tsx
// Edit service page

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SERVICE_CATEGORIES } from '@/lib/constants'
import { validateServiceForm } from '@/lib/utils/validation'

interface ServiceFormData {
  title: string
  description: string
  price_from: number
  price_to: number
  category: string
  tags: string
  delivery_time: string
  image_url: string | null
  portfolio_urls: string[]
}

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string
  const supabase = createClient()

  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    price_from: 0,
    price_to: 0,
    category: '',
    tags: '',
    delivery_time: '',
    image_url: null,
    portfolio_urls: [],
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadService()
  }, [serviceId])

  const loadService = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: service, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (error) throw error

      // Check if user owns this service
      if (service.seller_id !== user.id) {
        router.push('/my-listings')
        return
      }

      setFormData({
        title: service.title,
        description: service.description,
        price_from: service.price_from,
        price_to: service.price_to || service.price_from,
        category: service.category,
        tags: service.tags?.join(', ') || '',
        delivery_time: service.delivery_time || '',
        image_url: service.image_url,
        portfolio_urls: service.portfolio_urls || [],
      })

      if (service.image_url) {
        setImagePreview(service.image_url)
      }
    } catch (error) {
      console.error('Error loading service:', error)
      router.push('/my-listings')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPortfolioFiles(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      // Validate form
      const validation = validateServiceForm({
        title: formData.title,
        description: formData.description,
        price_from: formData.price_from.toString(),
        category: formData.category,
        delivery_time: formData.delivery_time,
      })

      if (!validation.isValid) {
        setErrors(validation.errors)
        setSubmitting(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let imageUrl = formData.image_url
      let portfolioUrls = formData.portfolio_urls

      // Upload new image if provided
      if (imageFile) {
        const imageExt = imageFile.name.split('.').pop()
        const imagePath = `${user.id}/${serviceId}-${Date.now()}.${imageExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(imagePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(imagePath)

        imageUrl = publicUrl

        // Delete old image if exists
        if (formData.image_url) {
          const oldPath = formData.image_url.split('/service-images/')[1]
          if (oldPath) {
            await supabase.storage.from('service-images').remove([oldPath])
          }
        }
      }

      // Upload new portfolio files if provided
      if (portfolioFiles.length > 0) {
        const uploadPromises = portfolioFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop()
          const filePath = `${user.id}/${serviceId}-portfolio-${Date.now()}-${index}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('service-portfolios')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('service-portfolios')
            .getPublicUrl(filePath)

          return publicUrl
        })

        const newPortfolioUrls = await Promise.all(uploadPromises)
        
        // Delete old portfolio files
        if (formData.portfolio_urls.length > 0) {
          const oldPaths = formData.portfolio_urls
            .map(url => url.split('/service-portfolios/')[1])
            .filter(Boolean)
          
          if (oldPaths.length > 0) {
            await supabase.storage.from('service-portfolios').remove(oldPaths)
          }
        }

        portfolioUrls = newPortfolioUrls
      }

      // Update service
      const { error: updateError } = await supabase
        .from('services')
        .update({
          title: formData.title,
          description: formData.description,
          price_from: formData.price_from,
          price_to: formData.price_to || formData.price_from,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          delivery_time: formData.delivery_time,
          image_url: imageUrl,
          portfolio_urls: portfolioUrls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)

      if (updateError) throw updateError

      router.push('/my-listings')
    } catch (error) {
      console.error('Error updating service:', error)
      setErrors({ submit: 'Failed to update service. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B2C]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Service</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Professional Logo Design"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your service in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price_from" className="block text-sm font-medium text-gray-700 mb-2">
                  Price From (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="price_from"
                    value={formData.price_from}
                    onChange={(e) => setFormData({ ...formData, price_from: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent ${
                      errors.price_from ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price_from && <p className="mt-1 text-sm text-red-600">{errors.price_from}</p>}
              </div>

              <div>
                <label htmlFor="price_to" className="block text-sm font-medium text-gray-700 mb-2">
                  Price To (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="price_to"
                    value={formData.price_to}
                    onChange={(e) => setFormData({ ...formData, price_to: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Optional: Leave blank if fixed price</p>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {SERVICE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Delivery Time */}
            <div>
              <label htmlFor="delivery_time" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time *
              </label>
              <input
                type="text"
                id="delivery_time"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent ${
                  errors.delivery_time ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 3-5 days, 1 week, 2 weeks"
              />
              {errors.delivery_time && <p className="mt-1 text-sm text-red-600">{errors.delivery_time}</p>}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
                placeholder="e.g., logo design, branding, creative"
              />
            </div>

            {/* Service Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Image {imagePreview && '(Current image shown)'}
              </label>
              {imagePreview && (
                <div className="mb-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">Upload a new image to replace the current one</p>
            </div>

            {/* Portfolio Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio Images {formData.portfolio_urls.length > 0 && `(${formData.portfolio_urls.length} files uploaded)`}
              </label>
              {formData.portfolio_urls.length > 0 && (
                <div className="mb-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formData.portfolio_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePortfolioChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload new portfolio images to replace all current ones (you can select multiple files)
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#FF6B2C] text-white py-3 px-6 rounded-lg hover:bg-[#ff5516] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Updating...' : 'Update Service'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}