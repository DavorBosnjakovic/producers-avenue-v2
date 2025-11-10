// File: fileUpload.ts
// Path: /src/lib/utils/fileUpload.ts
// File upload utility functions

import { createClient } from '@/lib/supabase/client'

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  PRODUCT_FILE: 100 * 1024 * 1024, // 100MB
  PORTFOLIO: 10 * 1024 * 1024, // 10MB
}

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  PRODUCT: [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  VIDEO: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
}

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Generate unique file name
 */
export function generateFileName(userId: string, originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${userId}/${timestamp}-${random}.${extension}`
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  bucket: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file size
    if (!validateFileSize(file, MAX_FILE_SIZES.IMAGE)) {
      return {
        success: false,
        error: 'Image size must be less than 5MB',
      }
    }

    // Validate file type
    if (!validateFileType(file, ALLOWED_FILE_TYPES.IMAGE)) {
      return {
        success: false,
        error: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP',
      }
    }

    const supabase = createClient()
    const fileName = generateFileName(userId, file.name)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return {
        success: false,
        error: 'Failed to upload image',
      }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Upload product file to Supabase Storage
 */
export async function uploadProductFile(
  file: File,
  bucket: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file size
    if (!validateFileSize(file, MAX_FILE_SIZES.PRODUCT_FILE)) {
      return {
        success: false,
        error: 'File size must be less than 100MB',
      }
    }

    const supabase = createClient()
    const fileName = generateFileName(userId, file.name)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return {
        success: false,
        error: 'Failed to upload file',
      }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Upload multiple images (for portfolio)
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string,
  userId: string
): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, bucket, userId))
    const results = await Promise.all(uploadPromises)

    const failed = results.find(result => !result.success)
    if (failed) {
      return {
        success: false,
        error: failed.error || 'Failed to upload one or more images',
      }
    }

    const urls = results.map(result => result.url!).filter(Boolean)

    return {
      success: true,
      urls,
    }
  } catch (error) {
    console.error('Multiple upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  url: string,
  bucket: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Extract file path from URL
    const path = url.split(`/${bucket}/`)[1]
    if (!path) {
      console.error('Invalid file URL')
      return false
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Delete multiple files from Supabase Storage
 */
export async function deleteMultipleFiles(
  urls: string[],
  bucket: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Extract file paths from URLs
    const paths = urls
      .map(url => url.split(`/${bucket}/`)[1])
      .filter(Boolean)

    if (paths.length === 0) {
      return false
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      if (minWidth && img.width < minWidth) {
        resolve({
          valid: false,
          error: `Image width must be at least ${minWidth}px`,
        })
        return
      }

      if (minHeight && img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image height must be at least ${minHeight}px`,
        })
        return
      }

      if (maxWidth && img.width > maxWidth) {
        resolve({
          valid: false,
          error: `Image width must be less than ${maxWidth}px`,
        })
        return
      }

      if (maxHeight && img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Image height must be less than ${maxHeight}px`,
        })
        return
      }

      resolve({ valid: true })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        valid: false,
        error: 'Failed to load image',
      })
    }

    img.src = objectUrl
  })
}