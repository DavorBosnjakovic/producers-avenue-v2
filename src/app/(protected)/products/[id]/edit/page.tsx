// File: page.tsx
// Path: /src/app/(protected)/products/[id]/edit/page.tsx
// Edit product page

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { validateProductForm } from '@/lib/utils/validation'

interface ProductFormData {
  title: string
  description: string
  price: number
  category: string
  tags: string
  image_url: string | null
  file_url: string | null
  demo_url: string | null
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const supabase = createClient()

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    tags: '',
    image_url: null,
    file_url: null,
    demo_url: null,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [demoFile, setDemoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error

      // Check if user owns this product
      if (product.seller_id !== user.id) {
        router.push('/my-listings')
        return
      }

      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        tags: product.tags?.join(', ') || '',
        image_url: product.image_url,
        file_url: product.file_url,
        demo_url: product.demo_url,
      })

      if (product.image_url) {
        setImagePreview(product.image_url)
      }
    } catch (error) {
      console.error('Error loading product:', error)
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

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainFile(file)
    }
  }

  const handleDemoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDemoFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      // Validate form
      const validation = validateProductForm({
        title: formData.title,
        description: formData.description,
        price: formData.price.toString(),
        category: formData.category,
      })

      if (!validation.isValid) {
        setErrors(validation.errors)
        setSubmitting(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let imageUrl = formData.image_url
      let fileUrl = formData.file_url
      let demoUrl = formData.demo_url

      // Upload new image if provided
      if (imageFile) {
        const imageExt = imageFile.name.split('.').pop()
        const imagePath = `${user.id}/${productId}-${Date.now()}.${imageExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(imagePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(imagePath)

        imageUrl = publicUrl

        // Delete old image if exists
        if (formData.image_url) {
          const oldPath = formData.image_url.split('/product-images/')[1]
          if (oldPath) {
            await supabase.storage.from('product-images').remove([oldPath])
          }
        }
      }

      // Upload new main file if provided
      if (mainFile) {
        const fileExt = mainFile.name.split('.').pop()
        const filePath = `${user.id}/${productId}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('product-files')
          .upload(filePath, mainFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-files')
          .getPublicUrl(filePath)

        fileUrl = publicUrl

        // Delete old file if exists
        if (formData.file_url) {
          const oldPath = formData.file_url.split('/product-files/')[1]
          if (oldPath) {
            await supabase.storage.from('product-files').remove([oldPath])
          }
        }
      }

      // Upload new demo file if provided
      if (demoFile) {
        const demoExt = demoFile.name.split('.').pop()
        const demoPath = `${user.id}/${productId}-demo-${Date.now()}.${demoExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('product-demos')
          .upload(demoPath, demoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-demos')
          .getPublicUrl(demoPath)

        demoUrl = publicUrl

        // Delete old demo if exists
        if (formData.demo_url) {
          const oldPath = formData.demo_url.split('/product-demos/')[1]
          if (oldPath) {
            await supabase.storage.from('product-demos').remove([oldPath])
          }
        }
      }

      // Update product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          image_url: imageUrl,
          file_url: fileUrl,
          demo_url: demoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)

      if (updateError) throw updateError

      router.push('/my-listings')
    } catch (error) {
      console.error('Error updating product:', error)
      setErrors({ submit: 'Failed to update product. Please try again.' })
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Professional Website Template"
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
                placeholder="Describe your product in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
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
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
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
                placeholder="e.g., responsive, modern, customizable"
              />
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image {imagePreview && '(Current image shown)'}
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

            {/* Main Product File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Product File {formData.file_url && '(File already uploaded)'}
              </label>
              <input
                type="file"
                onChange={handleMainFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload a new file to replace the current one. This file will be delivered to buyers.
              </p>
            </div>

            {/* Demo File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo/Preview File (Optional) {formData.demo_url && '(Demo already uploaded)'}
              </label>
              <input
                type="file"
                onChange={handleDemoFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload a new demo file to replace the current one (e.g., preview version, sample)
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
                {submitting ? 'Updating...' : 'Update Product'}
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