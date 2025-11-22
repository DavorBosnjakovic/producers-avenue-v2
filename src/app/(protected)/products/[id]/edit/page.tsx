// File: page.tsx
// Path: /src/app/(protected)/products/[id]/edit/page.tsx
// Edit product page

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { validateProductForm } from '@/lib/utils/validation'
import Link from 'next/link'
import { Percent } from 'lucide-react'

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

  async function loadProduct() {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', productId)
        .single()

      if (error) throw error

      if (product) {
        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price || 0,
          category: product.category || '',
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
          image_url: product.image_url,
          file_url: product.file_url,
          demo_url: product.demo_url,
        })
        if (product.image_url) {
          setImagePreview(product.image_url)
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
      setErrors({ submit: 'Failed to load product' })
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(field: keyof ProductFormData, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  function handleMainFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setMainFile(file)
    }
  }

  function handleDemoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setDemoFile(file)
    }
  }

  async function uploadFile(file: File, bucket: string, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return urlData.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      // Validate form
      const validation = validateProductForm(formData)
      if (!validation.isValid) {
        setErrors(validation.errors)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErrors({ submit: 'You must be logged in to edit products' })
        return
      }

      let imageUrl = formData.image_url
      let mainFileUrl = formData.file_url
      let demoUrl = formData.demo_url

      // Upload new image if selected
      if (imageFile) {
        const imagePath = `products/${user.id}/${Date.now()}_${imageFile.name}`
        imageUrl = await uploadFile(imageFile, 'product-images', imagePath)
      }

      // Upload new main file if selected
      if (mainFile) {
        const mainFilePath = `products/${user.id}/${Date.now()}_${mainFile.name}`
        mainFileUrl = await uploadFile(mainFile, 'product-files', mainFilePath)
      }

      // Upload new demo file if selected
      if (demoFile) {
        const demoPath = `products/${user.id}/${Date.now()}_${demoFile.name}`
        demoUrl = await uploadFile(demoFile, 'product-demos', demoPath)
      }

      // Update product in database
      const { error: updateError } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          image_url: imageUrl,
          file_url: mainFileUrl,
          demo_url: demoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId)

      if (updateError) throw updateError

      // Redirect back to product page or my listings
      router.push('/my-listings')
    } catch (error: any) {
      console.error('Error updating product:', error)
      setErrors({ submit: error.message || 'Failed to update product' })
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Product
            </h1>
            <p className="text-gray-600">
              Update your product details and files
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
                placeholder="e.g., Trap Beat Pack Vol. 1"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent resize-none"
                placeholder="Describe your product in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
              >
                <option value="">Select a category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
                placeholder="e.g., trap, hip-hop, dark, hard"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate tags with commas
              </p>
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image {formData.image_url && '(Current image will be replaced)'}
              </label>
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full max-w-xs rounded-lg"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload a new image to replace the current one
              </p>
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

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#FF6B2C] text-white py-3 px-6 rounded-lg hover:bg-[#ff5516] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
              
              <Link
                href={`/products/${productId}/discount-codes`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#009ae9] text-[#009ae9] rounded-lg hover:bg-[#009ae9] hover:text-white transition-colors font-medium"
              >
                <Percent size={18} />
                Manage Discounts
              </Link>
              
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