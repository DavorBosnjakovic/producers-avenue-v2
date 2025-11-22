// File: bunny.ts
// Path: /src/lib/bunny.ts
// Bunny.net Storage & CDN Integration

/**
 * BUNNY.NET SETUP REQUIRED:
 * 
 * 1. Create Storage Zone:
 *    - Go to https://dash.bunny.net/storage
 *    - Click "Add Storage Zone"
 *    - Name: "producersavenue-products" (or your choice)
 *    - Region: Choose closest to your users (e.g., NY, LA, London)
 *    - Replication: Optional (for backups)
 * 
 * 2. Get Storage API Key:
 *    - After creating storage zone, go to "FTP & API Access"
 *    - Copy the "Storage API Key" (NOT Account API Key)
 *    - Add to .env.local: BUNNY_STORAGE_API_KEY=xxx
 * 
 * 3. Create Pull Zone (CDN):
 *    - Go to https://dash.bunny.net/pullzones
 *    - Click "Add Pull Zone"
 *    - Name: "producersavenue-cdn" (or your choice)
 *    - Origin Type: "Bunny Storage Zone"
 *    - Select your storage zone created in step 1
 *    - Enable "Enable Storage Zone Auto-Index"
 * 
 * 4. Get Pull Zone Hostname:
 *    - After creating, you'll see hostname like: producersavenue-cdn.b-cdn.net
 *    - Add to .env.local: BUNNY_CDN_HOSTNAME=producersavenue-cdn.b-cdn.net
 * 
 * 5. Environment Variables Needed:
 *    BUNNY_STORAGE_API_KEY=your-storage-api-key
 *    BUNNY_STORAGE_ZONE_NAME=producersavenue-products
 *    BUNNY_STORAGE_REGION=ny (or your chosen region)
 *    BUNNY_CDN_HOSTNAME=producersavenue-cdn.b-cdn.net
 * 
 * REGIONS:
 * - ny = New York (US East)
 * - la = Los Angeles (US West)
 * - sg = Singapore (Asia)
 * - de = Frankfurt (Europe)
 * - uk = London (Europe)
 * - syd = Sydney (Oceania)
 */

// Environment variables
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || process.env.NEXT_PUBLIC_BUNNY_STORAGE_API_KEY
const STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME || process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE_NAME
const STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || process.env.NEXT_PUBLIC_BUNNY_STORAGE_REGION || 'ny'
const CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME

// Storage API endpoints by region
const STORAGE_ENDPOINTS = {
  ny: 'https://ny.storage.bunnycdn.com',
  la: 'https://la.storage.bunnycdn.com',
  sg: 'https://sg.storage.bunnycdn.com',
  de: 'https://de.storage.bunnycdn.com',
  uk: 'https://uk.storage.bunnycdn.com',
  syd: 'https://syd.storage.bunnycdn.com',
}

/**
 * Get storage endpoint URL based on configured region
 */
function getStorageEndpoint(): string {
  return STORAGE_ENDPOINTS[STORAGE_REGION as keyof typeof STORAGE_ENDPOINTS] || STORAGE_ENDPOINTS.ny
}

/**
 * Upload file to Bunny Storage
 * 
 * @param file - File to upload
 * @param path - Storage path (e.g., "products/user-123/file.zip")
 * @returns Public CDN URL for the uploaded file
 * 
 * @example
 * const file = new File(['content'], 'beat.zip')
 * const url = await uploadToBunny(file, 'products/user-123/beat.zip')
 * // Returns: https://producersavenue-cdn.b-cdn.net/products/user-123/beat.zip
 */
export async function uploadToBunny(file: File, path: string): Promise<string> {
  // Validate configuration
  if (!STORAGE_API_KEY) {
    throw new Error('Bunny Storage API key not configured. Add BUNNY_STORAGE_API_KEY to .env.local')
  }
  if (!STORAGE_ZONE_NAME) {
    throw new Error('Bunny Storage Zone name not configured. Add BUNNY_STORAGE_ZONE_NAME to .env.local')
  }
  if (!CDN_HOSTNAME) {
    throw new Error('Bunny CDN hostname not configured. Add BUNNY_CDN_HOSTNAME to .env.local')
  }

  try {
    // Construct storage URL
    const storageEndpoint = getStorageEndpoint()
    const uploadUrl = `${storageEndpoint}/${STORAGE_ZONE_NAME}/${path}`

    console.log('📤 Uploading to Bunny Storage:', {
      path,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      endpoint: storageEndpoint
    })

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload to Bunny Storage
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': STORAGE_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: arrayBuffer,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Bunny upload failed (${response.status}): ${errorText}`)
    }

    // Return CDN URL
    const cdnUrl = `https://${CDN_HOSTNAME}/${path}`
    console.log('✅ Upload successful:', cdnUrl)
    
    return cdnUrl

  } catch (error: any) {
    console.error('❌ Bunny upload error:', error)
    throw new Error(`Failed to upload to Bunny Storage: ${error.message}`)
  }
}

/**
 * Delete file from Bunny Storage
 * 
 * @param path - Storage path to delete
 * 
 * @example
 * await deleteFromBunny('products/user-123/old-beat.zip')
 */
export async function deleteFromBunny(path: string): Promise<void> {
  if (!STORAGE_API_KEY || !STORAGE_ZONE_NAME) {
    throw new Error('Bunny configuration missing')
  }

  try {
    const storageEndpoint = getStorageEndpoint()
    const deleteUrl = `${storageEndpoint}/${STORAGE_ZONE_NAME}/${path}`

    console.log('🗑️ Deleting from Bunny Storage:', path)

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'AccessKey': STORAGE_API_KEY,
      },
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(`Delete failed (${response.status})`)
    }

    console.log('✅ Delete successful')

  } catch (error: any) {
    console.error('❌ Bunny delete error:', error)
    throw new Error(`Failed to delete from Bunny Storage: ${error.message}`)
  }
}

/**
 * Get file info from Bunny Storage
 * 
 * @param path - Storage path
 * @returns File metadata or null if not found
 */
export async function getBunnyFileInfo(path: string): Promise<any | null> {
  if (!STORAGE_API_KEY || !STORAGE_ZONE_NAME) {
    throw new Error('Bunny configuration missing')
  }

  try {
    const storageEndpoint = getStorageEndpoint()
    const url = `${storageEndpoint}/${STORAGE_ZONE_NAME}/${path}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'AccessKey': STORAGE_API_KEY,
      },
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to get file info (${response.status})`)
    }

    return await response.json()

  } catch (error: any) {
    console.error('Bunny file info error:', error)
    return null
  }
}

/**
 * List files in a directory on Bunny Storage
 * 
 * @param directory - Directory path (e.g., "products/user-123/")
 * @returns Array of files and folders
 */
export async function listBunnyFiles(directory: string): Promise<any[]> {
  if (!STORAGE_API_KEY || !STORAGE_ZONE_NAME) {
    throw new Error('Bunny configuration missing')
  }

  try {
    const storageEndpoint = getStorageEndpoint()
    const url = `${storageEndpoint}/${STORAGE_ZONE_NAME}/${directory}/`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'AccessKey': STORAGE_API_KEY,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to list files (${response.status})`)
    }

    return await response.json()

  } catch (error: any) {
    console.error('Bunny list files error:', error)
    return []
  }
}

/**
 * Generate a signed URL for secure file access (optional, for private files)
 * Note: Basic implementation - Bunny.net has more advanced token authentication
 * 
 * @param path - File path
 * @param expiresInSeconds - URL validity duration (default: 1 hour)
 * @returns CDN URL (basic version without signing)
 */
export function generateBunnySignedUrl(path: string, expiresInSeconds: number = 3600): string {
  // For MVP, just return the CDN URL
  // In production, implement Bunny's token authentication:
  // https://docs.bunny.net/docs/stream-token-authentication
  
  if (!CDN_HOSTNAME) {
    throw new Error('CDN hostname not configured')
  }

  return `https://${CDN_HOSTNAME}/${path}`
}

/**
 * Purge CDN cache for a specific file
 * (Useful when updating a file)
 * 
 * @param path - File path to purge
 */
export async function purgeBunnyCache(path: string): Promise<void> {
  // This requires the Account API Key (different from Storage API Key)
  // For MVP, we can skip this - files will cache-bust via unique names
  console.log('Cache purge not implemented (use unique filenames instead)')
}

// Export configuration info for debugging
export const bunnyConfig = {
  configured: !!(STORAGE_API_KEY && STORAGE_ZONE_NAME && CDN_HOSTNAME),
  region: STORAGE_REGION,
  endpoint: getStorageEndpoint(),
  cdnHostname: CDN_HOSTNAME,
  storageZone: STORAGE_ZONE_NAME,
}