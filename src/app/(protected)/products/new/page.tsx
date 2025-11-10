// File: page.tsx
// Path: /src/app/(protected)/products/new/page.tsx
// Create new product page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const CATEGORIES = [
  'Beats',
  'Samples',
  'Loops',
  'Presets',
  'Kits',
  'MIDI',
  'Vocals',
  'Sound Effects',
  'Templates',
  'Other'
]

const FILE_TYPES = [
  'WAV',
  'MP3',
  'MIDI',
  'ZIP',
  'FLP',
  'ALS',
  'Logic',
  'Other'
]

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Beats',
    price: '',
    file_type: 'WAV',
    bpm: '',
    key: '',
    tags: '',
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [productFile, setProductFile] = useState<File | null>(null)
  const [demoFile, setDemoFile] = useState<File | null>(null)

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

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setError('Product file must be less than 500MB')
        return
      }
      setProductFile(file)
    }
  }

  const handleDemoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 50MB for demo)
      if (file.size > 50 * 1024 * 1024) {
        setError('Demo file must be less than 50MB')
        return
      }
      setDemoFile(file)
    }
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

      if (!productFile) {
        throw new Error('Please upload the product file')
      }

      // Upload images
      const imageUrls: string[] = []
      for (let i = 0; i < images.length; i++) {
        const path = `products/${user.id}/${Date.now()}_${i}_${images[i].name}`
        const url = await uploadFile(images[i], 'product-images', path)
        imageUrls.push(url)
      }

      // Upload product file
      const productPath = `products/${user.id}/${Date.now()}_${productFile.name}`
      const productFileUrl = await uploadFile(productFile, 'product-files', productPath)

      // Upload demo file if provided
      let demoFileUrl = null
      if (demoFile) {
        const demoPath = `demos/${user.id}/${Date.now()}_${demoFile.name}`
        demoFileUrl = await uploadFile(demoFile, 'product-demos', demoPath)
      }

      // Create product
      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          file_type: formData.file_type,
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
          key: formData.key || null,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          images: imageUrls,
          file_url: productFileUrl,
          demo_url: demoFileUrl,
          status: 'active',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Redirect to product page
      router.push(`/marketplace/products/${product.product_id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-favorit font-bold text-white mb-2">
            List a Product
          </h1>
          <p className="text-[#888888] font-inter">
            Share your beats, samples, or sound packs with the community
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
                  placeholder="e.g., Dark Trap Beat - 140 BPM"
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
                  placeholder="Describe your product, what's included, usage rights, etc."
                  rows={6}
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
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="29.99"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors font-inter"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-favorit font-bold text-white mb-4">
              Technical Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="file_type" className="block text-sm font-medium text-white mb-2 font-inter">
                  File Type *
                </label>
                <select
                  id="file_type"
                  name="file_type"
                  value={formData.file_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-white transition-colors font-inter"
                  required
                >
                  {FILE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="bpm" className="block text-sm font-medium text-white mb-2 font-inter">
                  BPM (optional)
                </label>
                <input
                  type="number"
                  id="bpm"
                  name="bpm"
                  value={formData.bpm}
                  onChange={handleInputChange}
                  placeholder="140"
                  min="1"
                  max="300"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors font-inter"
                />
              </div>

              <div>
                <label htmlFor="key" className="block text-sm font-medium text-white mb-2 font-inter">
                  Key (optional)
                </label>
                <input
                  type="text"
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  placeholder="Am"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors font-inter"
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
                placeholder="trap, dark, 808, hard"
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
                  Product Images (up to 5)
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

          {/* Files */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <h2 className="text-xl font-favorit font-bold text-white mb-4">
              Files
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-inter">
                  Product File * (max 500MB)
                </label>
                <input
                  type="file"
                  onChange={handleProductFileChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1a1a1a] file:text-white hover:file:bg-[#222222] file:cursor-pointer font-inter"
                  required
                />
                {productFile && (
                  <p className="mt-2 text-sm text-[#888888] font-inter">
                    Selected: {productFile.name} ({(productFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 font-inter">
                  Demo/Preview File (optional, max 50MB)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleDemoFileChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1a1a1a] file:text-white hover:file:bg-[#222222] file:cursor-pointer font-inter"
                />
                {demoFile && (
                  <p className="mt-2 text-sm text-[#888888] font-inter">
                    Selected: {demoFile.name} ({(demoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
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
              {loading ? 'Creating...' : 'List Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}