// File: page.tsx
// Path: /src/app/(protected)/create/product/page.tsx
// Create Product Page - Updated with Compare-At Price, Tags, and Inventory

'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { uploadToBunny } from '@/lib/bunny'
import { ArrowLeft, Upload, X, Loader2, CheckCircle, AlertCircle, Info, Plus, Tag } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  sort_order: number
}

interface UploadedFile {
  file: File
  preview?: string
  status: 'uploading' | 'scanning' | 'complete' | 'error'
  url?: string
  error?: string
  progress?: number
}

export default function CreateProductPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '', // NEW: Original price for strikethrough
    licenseType: 'commercial',
    licenseTerms: '',
  })

  // NEW: Tags management
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // NEW: Inventory tracking
  const [trackInventory, setTrackInventory] = useState(false)
  const [stockQuantity, setStockQuantity] = useState<string>('')

  // Files
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [mainFile, setMainFile] = useState<UploadedFile | null>(null)
  const [previewFiles, setPreviewFiles] = useState<UploadedFile[]>([])

  // Custom product type (if Custom Product selected)
  const [customTypeName, setCustomTypeName] = useState('')
  const [isCustomProduct, setIsCustomProduct] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      
      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [])

  // Handle category toggle
  const toggleCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    const isCustom = category?.slug === 'custom-product'

    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // Removing
        if (isCustom) setIsCustomProduct(false)
        return prev.filter(id => id !== categoryId)
      } else {
        // Adding
        if (isCustom) setIsCustomProduct(true)
        return [...prev, categoryId]
      }
    })
  }

  // NEW: Handle tag input
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      
      // Check for duplicates
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  // NEW: Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB')
      return
    }

    setThumbnail(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  // Upload thumbnail to Supabase Storage
  const uploadThumbnail = async (file: File): Promise<string> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const fileName = `${user!.id}/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  // Handle main file upload (ZIP only)
  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Main file must be a ZIP file')
      return
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      alert('File too large. Max 500MB')
      return
    }

    setMainFile({
      file,
      status: 'uploading',
      progress: 0
    })

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Upload to temporary Supabase storage
      setMainFile(prev => prev ? { ...prev, progress: 20 } : null)
      const tempFileName = `temp/${user!.id}/${Date.now()}-${file.name}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp-uploads')
        .upload(tempFileName, file)

      if (uploadError) throw uploadError

      // 2. Get temporary URL
      setMainFile(prev => prev ? { ...prev, progress: 40 } : null)
      const { data: urlData } = supabase.storage
        .from('temp-uploads')
        .getPublicUrl(tempFileName)

      // 3. Scan for viruses
      setMainFile(prev => prev ? { ...prev, status: 'scanning', progress: 60 } : null)
      
      const scanResponse = await fetch('/api/scan-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileUrl: urlData.publicUrl,
          fileName: tempFileName
        })
      })

      const scanResult = await scanResponse.json()

      if (!scanResult.success) {
        // Delete temp file
        await supabase.storage.from('temp-uploads').remove([tempFileName])
        throw new Error(scanResult.error || 'File failed security scan')
      }

      // 4. Upload to Bunny.net
      setMainFile(prev => prev ? { ...prev, progress: 80 } : null)
      const bunnyPath = `products/${user!.id}/${Date.now()}-${file.name}`
      const bunnyUrl = await uploadToBunny(file, bunnyPath)

      // 5. Delete temp file from Supabase
      await supabase.storage.from('temp-uploads').remove([tempFileName])

      // 6. Update state
      setMainFile({
        file,
        status: 'complete',
        url: bunnyUrl,
        progress: 100
      })

    } catch (error: any) {
      console.error('Error uploading main file:', error)
      setMainFile(prev => prev ? {
        ...prev,
        status: 'error',
        error: error.message
      } : null)
    }
  }

  // Handle preview files upload (MP3 only, max 5)
  const handlePreviewFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate count
    if (previewFiles.length + files.length > 5) {
      alert('Maximum 5 preview files allowed')
      return
    }

    // Validate file types
    const invalidFiles = files.filter(f => !f.name.toLowerCase().endsWith('.mp3'))
    if (invalidFiles.length > 0) {
      alert('Preview files must be MP3 format')
      return
    }

    // Validate file sizes (max 20MB each)
    const tooLargeFiles = files.filter(f => f.size > 20 * 1024 * 1024)
    if (tooLargeFiles.length > 0) {
      alert('Preview files must be under 20MB each')
      return
    }

    // Process each file
    for (const file of files) {
      const uploadedFile: UploadedFile = {
        file,
        status: 'uploading',
        preview: URL.createObjectURL(file),
        progress: 0
      }

      setPreviewFiles(prev => [...prev, uploadedFile])

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Upload to temp storage
        const tempFileName = `temp/${user!.id}/previews/${Date.now()}-${file.name}`
        
        await supabase.storage.from('temp-uploads').upload(tempFileName, file)
        const { data: urlData } = supabase.storage.from('temp-uploads').getPublicUrl(tempFileName)

        // Scan
        setPreviewFiles(prev => prev.map(f => 
          f.file === file ? { ...f, status: 'scanning', progress: 50 } : f
        ))

        const scanResponse = await fetch('/api/scan-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrl: urlData.publicUrl, fileName: tempFileName })
        })

        const scanResult = await scanResponse.json()
        if (!scanResult.success) {
          await supabase.storage.from('temp-uploads').remove([tempFileName])
          throw new Error(scanResult.error)
        }

        // Upload to Bunny
        setPreviewFiles(prev => prev.map(f => 
          f.file === file ? { ...f, progress: 80 } : f
        ))

        const bunnyPath = `products/${user!.id}/previews/${Date.now()}-${file.name}`
        const bunnyUrl = await uploadToBunny(file, bunnyPath)

        // Update state
        setPreviewFiles(prev => prev.map(f => 
          f.file === file ? { ...f, status: 'complete', url: bunnyUrl, progress: 100 } : f
        ))

        // Cleanup
        await supabase.storage.from('temp-uploads').remove([tempFileName])

      } catch (error: any) {
        console.error('Error uploading preview file:', error)
        setPreviewFiles(prev => prev.map(f =>
          f.file === file ? { ...f, status: 'error', error: error.message } : f
        ))
      }
    }
  }

  // Remove preview file
  const removePreviewFile = (index: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Please log in to create a product')
        router.push('/login')
        return
      }

      // Validation
      if (!formData.title.trim()) {
        alert('Please enter a product title')
        return
      }

      if (selectedCategories.length === 0) {
        alert('Please select at least one category')
        return
      }

      if (isCustomProduct && !customTypeName.trim()) {
        alert('Please specify your custom product type')
        return
      }

      if (!mainFile || mainFile.status !== 'complete') {
        alert('Please upload the main product file')
        return
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        alert('Please enter a valid price')
        return
      }

      // NEW: Validate compare-at price if provided
      if (formData.compareAtPrice) {
        const comparePrice = parseFloat(formData.compareAtPrice)
        const currentPrice = parseFloat(formData.price)
        if (comparePrice <= currentPrice) {
          alert('Compare-at price must be higher than the current price')
          return
        }
      }

      // NEW: Validate inventory
      if (trackInventory) {
        if (!stockQuantity || parseInt(stockQuantity) < 0) {
          alert('Please enter a valid stock quantity (0 or higher)')
          return
        }
      }

      // Upload thumbnail if exists
      let thumbnailUrl = null
      if (thumbnail) {
        thumbnailUrl = await uploadThumbnail(thumbnail)
      }

      // Prepare category data
      const primaryCategoryId = selectedCategories[0]
      const additionalCategories = categories
        .filter(c => selectedCategories.includes(c.id))
        .map(c => c.name)

      // Calculate file size
      const fileSizeMB = mainFile.file.size / (1024 * 1024)

      // Determine approval status
      const approvalStatus = isCustomProduct ? 'pending' : 'approved'
      const status = isCustomProduct ? 'draft' : 'active'

      // Create product
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          title: formData.title,
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
          description: formData.description,
          price: parseFloat(formData.price),
          compare_at_price: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null, // NEW
          
          // Files
          file_urls: [mainFile.url!],
          file_size_mb: parseFloat(fileSizeMB.toFixed(2)),
          file_format: 'ZIP',
          thumbnail_url: thumbnailUrl,
          preview_urls: previewFiles
            .filter(f => f.status === 'complete')
            .map(f => f.url!),
          
          // Categories & Tags
          marketplace_category_id: primaryCategoryId,
          tags: [...additionalCategories, ...tags], // NEW: Combined with user tags
          
          // License
          license_type: formData.licenseType,
          license_terms: formData.licenseTerms,
          
          // NEW: Inventory tracking
          track_inventory: trackInventory,
          stock_quantity: trackInventory ? parseInt(stockQuantity) : null,
          
          // Custom product handling
          is_custom: isCustomProduct,
          custom_type_name: isCustomProduct ? customTypeName : null,
          approval_status: approvalStatus,
          
          // Status
          status: status,
          
          // Defaults
          download_limit: 5,
          download_expiry_days: 30
        })
        .select()
        .single()

      if (error) throw error

      // Success message
      if (isCustomProduct) {
        alert('Product submitted for review! Our team will review your custom product type and approve it soon.')
      } else {
        alert('Product created successfully!')
      }

      // Redirect to store
      router.push('/store/me')
      
    } catch (error: any) {
      console.error('Error creating product:', error)
      alert('Failed to create product: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/store/me"
            className="inline-flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
            style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
          >
            <ArrowLeft size={20} />
            Back to Store
          </Link>
          <h1
            className="text-4xl md:text-5xl mb-2"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            CREATE PRODUCT
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            Sell digital downloads with instant delivery
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] p-6 md:p-8 space-y-8">
            
            {/* Basic Information */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                BASIC INFORMATION
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="e.g., Trap Beat Pack Vol. 1"
                  />
                </div>

                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="Describe your product..."
                  />
                </div>

                {/* Pricing Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block mb-2 font-medium"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                      style={{
                        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)',
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  {/* NEW: Compare-at Price */}
                  <div>
                    <label
                      className="block mb-2 font-medium"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      Compare-at Price (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                      style={{
                        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)',
                      }}
                      placeholder="0.00"
                    />
                    <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                      Original price to show as crossed out
                    </p>
                  </div>
                </div>

                {/* NEW: Price Preview */}
                {formData.price && formData.compareAtPrice && parseFloat(formData.compareAtPrice) > parseFloat(formData.price) && (
                  <div className="p-4 rounded-lg border" style={{ 
                    borderColor: '#10b981',
                    backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'
                  }}>
                    <p className="text-sm font-medium mb-2" style={{ color: '#10b981', fontFamily: 'var(--font-body)' }}>
                      Price Preview:
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg line-through" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                        ${parseFloat(formData.compareAtPrice).toFixed(2)}
                      </span>
                      <span className="text-2xl font-bold" style={{ color: '#10b981', fontFamily: 'var(--font-body)' }}>
                        ${parseFloat(formData.price).toFixed(2)}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-bold" style={{ 
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontFamily: 'var(--font-body)'
                      }}>
                        SAVE {Math.round((1 - parseFloat(formData.price) / parseFloat(formData.compareAtPrice)) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* NEW: Tags Section */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                TAGS & KEYWORDS
              </h2>
              <p 
                className="text-sm mb-4"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666' 
                }}
              >
                Add keywords to help buyers find your product (press Enter to add each tag)
              </p>

              <div className="space-y-4">
                {/* Tag Input */}
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: '#009ae9' }} />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="Type a tag and press Enter (e.g., trap, hip-hop, dark)"
                  />
                </div>

                {/* Tag Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 rounded-full border"
                        style={{
                          backgroundColor: theme === 'dark' ? 'rgba(0, 154, 233, 0.1)' : 'rgba(0, 154, 233, 0.05)',
                          borderColor: '#009ae9',
                        }}
                      >
                        <span style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>
                          {tag}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <X size={14} style={{ color: '#009ae9' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {tags.length === 0 && (
                  <p className="text-sm italic" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                    No tags added yet
                  </p>
                )}
              </div>
            </div>

            {/* NEW: Inventory Tracking Section */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                INVENTORY
              </h2>

              <div className="space-y-4">
                {/* Track Inventory Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(e) => {
                      setTrackInventory(e.target.checked)
                      if (!e.target.checked) {
                        setStockQuantity('')
                      }
                    }}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#009ae9] focus:ring-[#009ae9]"
                  />
                  <div>
                    <span className="font-medium" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a', fontFamily: 'var(--font-body)' }}>
                      Track inventory for this product
                    </span>
                    <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                      Enable this if you have limited quantities (e.g., limited edition, exclusive content)
                    </p>
                  </div>
                </label>

                {/* Stock Quantity Input (only shown when tracking is enabled) */}
                {trackInventory && (
                  <div className="ml-8 p-4 rounded-lg border" style={{
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9',
                  }}>
                    <label
                      className="block mb-2 font-medium"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required={trackInventory}
                      min="0"
                      step="1"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full max-w-xs px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                      style={{
                        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)',
                      }}
                      placeholder="Enter available quantity"
                    />
                    <p className="text-xs mt-2" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                      Product will be marked as "Out of Stock" when quantity reaches 0
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Categories - Multiple Selection */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                PRODUCT CATEGORIES
              </h2>
              <p 
                className="text-sm mb-4"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666' 
                }}
              >
                Select all categories that apply to your product (required: at least 1)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                    style={{
                      borderColor: selectedCategories.includes(category.id) 
                        ? '#009ae9' 
                        : theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      backgroundColor: selectedCategories.includes(category.id)
                        ? theme === 'dark' ? 'rgba(0, 154, 233, 0.1)' : 'rgba(0, 154, 233, 0.05)'
                        : theme === 'dark' ? '#0a0a0a' : '#ffffff'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#009ae9] focus:ring-[#009ae9]"
                    />
                    <div className="flex-1">
                      <div 
                        className="font-medium mb-1"
                        style={{ 
                          fontFamily: 'var(--font-body)',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                        }}
                      >
                        {category.name}
                      </div>
                      {category.description && (
                        <div 
                          className="text-xs"
                          style={{ 
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#666666' : '#999999' 
                          }}
                        >
                          {category.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Product Type Input */}
              {isCustomProduct && (
                <div className="mt-4 p-4 rounded-lg border-2" style={{ borderColor: '#f59e0b', backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)' }}>
                  <div className="flex items-start gap-2 mb-3">
                    <Info size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-600 mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                        Custom Product Type
                      </p>
                      <p className="text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                        Your product will be reviewed by our team before going live. Please specify what type of product this is.
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    required={isCustomProduct}
                    value={customTypeName}
                    onChange={(e) => setCustomTypeName(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="e.g., Custom Synthesizer Skins, Ableton Themes, etc."
                  />
                </div>
              )}
            </div>

            {/* Files Section */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                MEDIA & FILES
              </h2>

              <div className="space-y-6">
                {/* Thumbnail */}
                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Thumbnail Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail"
                  />
                  <label
                    htmlFor="thumbnail"
                    className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#009ae9] transition-colors"
                    style={{
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9',
                    }}
                  >
                    {thumbnailPreview ? (
                      <div className="space-y-2">
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="mx-auto max-h-40 rounded" />
                        <p className="text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2" size={40} style={{ color: '#009ae9' }} />
                        <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                          Click to upload thumbnail
                        </p>
                        <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                          PNG, JPG (max 5MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* Main File (ZIP) */}
                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Main Product File (ZIP) *
                  </label>
                  
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleMainFileUpload}
                    className="hidden"
                    id="main-file"
                    disabled={mainFile?.status === 'uploading' || mainFile?.status === 'scanning'}
                  />
                  
                  <label
                    htmlFor="main-file"
                    className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#009ae9] transition-colors"
                    style={{
                      borderColor: mainFile?.status === 'error' ? '#ef4444' : theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9',
                      pointerEvents: mainFile?.status === 'uploading' || mainFile?.status === 'scanning' ? 'none' : 'auto'
                    }}
                  >
                    {mainFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          {mainFile.status === 'uploading' && <Loader2 className="animate-spin" size={24} style={{ color: '#009ae9' }} />}
                          {mainFile.status === 'scanning' && <Loader2 className="animate-spin" size={24} style={{ color: '#009ae9' }} />}
                          {mainFile.status === 'complete' && <CheckCircle className="text-green-500" size={24} />}
                          {mainFile.status === 'error' && <AlertCircle className="text-red-500" size={24} />}
                          <span className="font-medium" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a', fontFamily: 'var(--font-body)' }}>
                            {mainFile.file.name}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        {(mainFile.status === 'uploading' || mainFile.status === 'scanning') && (
                          <div className="max-w-xs mx-auto">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${mainFile.progress || 0}%`,
                                  backgroundColor: '#009ae9'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {mainFile.status === 'uploading' && (
                          <p className="text-sm" style={{ color: '#009ae9', fontFamily: 'var(--font-body)' }}>
                            Uploading file...
                          </p>
                        )}
                        {mainFile.status === 'scanning' && (
                          <p className="text-sm" style={{ color: '#009ae9', fontFamily: 'var(--font-body)' }}>
                            🔒 Scanning for viruses... This keeps everyone safe!
                          </p>
                        )}
                        {mainFile.status === 'complete' && (
                          <p className="text-sm text-green-600" style={{ fontFamily: 'var(--font-body)' }}>
                            ✓ File uploaded successfully and verified clean
                          </p>
                        )}
                        {mainFile.error && (
                          <p className="text-sm text-red-500" style={{ fontFamily: 'var(--font-body)' }}>
                            {mainFile.error}
                          </p>
                        )}
                        
                        {mainFile.status === 'complete' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setMainFile(null)
                            }}
                            className="text-sm text-red-500 hover:text-red-600"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            Remove and upload different file
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2" size={40} style={{ color: '#009ae9' }} />
                        <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                          Click to upload ZIP file
                        </p>
                        <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                          Max 500MB • Will be scanned for viruses
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* Preview Files (MP3) */}
                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Preview Audio Files (MP3) - Up to 5
                  </label>
                  
                  <input
                    type="file"
                    accept=".mp3"
                    multiple
                    onChange={handlePreviewFilesUpload}
                    className="hidden"
                    id="preview-files"
                    disabled={previewFiles.length >= 5}
                  />
                  
                  {previewFiles.length < 5 && (
                    <label
                      htmlFor="preview-files"
                      className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#009ae9] transition-colors mb-4"
                      style={{
                        borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9',
                      }}
                    >
                      <Upload className="mx-auto mb-2" size={32} style={{ color: '#009ae9' }} />
                      <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                        Add preview audio files ({previewFiles.length}/5)
                      </p>
                      <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                        MP3 only • Max 20MB each
                      </p>
                    </label>
                  )}

                  {previewFiles.length > 0 && (
                    <div className="space-y-2">
                      {previewFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{
                            borderColor: file.status === 'error' ? '#ef4444' : theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                            backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9',
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {file.status === 'uploading' && <Loader2 className="animate-spin flex-shrink-0" size={18} style={{ color: '#009ae9' }} />}
                            {file.status === 'scanning' && <Loader2 className="animate-spin flex-shrink-0" size={18} style={{ color: '#009ae9' }} />}
                            {file.status === 'complete' && <CheckCircle className="text-green-500 flex-shrink-0" size={18} />}
                            {file.status === 'error' && <AlertCircle className="text-red-500 flex-shrink-0" size={18} />}
                            
                            <div className="flex-1 min-w-0">
                              <p className="truncate" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a', fontFamily: 'var(--font-body)' }}>
                                {file.file.name}
                              </p>
                              {file.status === 'scanning' && (
                                <p className="text-xs" style={{ color: '#009ae9', fontFamily: 'var(--font-body)' }}>
                                  Scanning...
                                </p>
                              )}
                              {file.error && (
                                <p className="text-xs text-red-500" style={{ fontFamily: 'var(--font-body)' }}>
                                  {file.error}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removePreviewFile(index)}
                            className="text-red-500 hover:text-red-600 flex-shrink-0 ml-2"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* License Information */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                LICENSE & TERMS
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    License Type *
                  </label>
                  <select
                    value={formData.licenseType}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <option value="personal">Personal Use Only</option>
                    <option value="commercial">Commercial Use</option>
                    <option value="exclusive">Exclusive Rights</option>
                    <option value="royalty_free">Royalty Free</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    License Terms (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.licenseTerms}
                    onChange={(e) => setFormData({ ...formData, licenseTerms: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="Add any additional license terms or restrictions..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t" style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
              <Link
                href="/store/me"
                className="px-8 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !mainFile || mainFile.status !== 'complete' || selectedCategories.length === 0}
                className="flex-1 px-8 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{ 
                  backgroundColor: '#009ae9',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Creating Product...
                  </span>
                ) : isCustomProduct ? (
                  'Submit for Review'
                ) : (
                  'Publish Product'
                )}
              </button>
            </div>

            {/* Info Box */}
            {isCustomProduct && (
              <div className="p-4 rounded-lg border" style={{ borderColor: '#f59e0b', backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)' }}>
                <div className="flex items-start gap-2">
                  <Info size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                    <strong className="text-yellow-600">Custom products require approval.</strong> Your product will be reviewed by our team within 24-48 hours. You'll receive a notification when it's approved and goes live.
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}