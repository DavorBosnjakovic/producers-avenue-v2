// File: route.ts
// Path: /src/app/api/scan-file/route.ts
// Virus Scanning API Route - FIXED FOR NEXT.JS 15+

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * VIRUS SCANNING OPTIONS:
 * 
 * For MVP: Skips scanning (not configured)
 * For Production: Add VirusTotal API key or use ClamAV
 */

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY
const VIRUSTOTAL_ENABLED = !!VIRUSTOTAL_API_KEY

/**
 * Scan file for viruses
 */
export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileName } = await request.json()

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Missing fileUrl or fileName' },
        { status: 400 }
      )
    }

    // Get authenticated user using server-side Supabase client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Scanning file:', fileName)

    // If VirusTotal not configured, skip scanning (MVP only!)
    if (!VIRUSTOTAL_ENABLED) {
      console.warn('⚠️ VirusTotal not configured - SKIPPING VIRUS SCAN')
      console.warn('⚠️ This is OK for testing, but add VIRUSTOTAL_API_KEY for production!')
      
      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'Virus scanning skipped (not configured)'
      })
    }

    // Download file from temporary storage
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error('Failed to download file for scanning')
    }

    const fileBlob = await fileResponse.blob()
    const fileBuffer = await fileBlob.arrayBuffer()

    // Submit file to VirusTotal
    const scanFormData = new FormData()
    scanFormData.append('file', new Blob([fileBuffer]), fileName)

    const scanResponse = await fetch('https://www.virustotal.com/api/v3/files', {
      method: 'POST',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY!,
      },
      body: scanFormData,
    })

    if (!scanResponse.ok) {
      const errorText = await scanResponse.text()
      console.error('VirusTotal scan submission failed:', errorText)
      throw new Error(`Scan submission failed: ${scanResponse.status}`)
    }

    const scanResult = await scanResponse.json()
    const analysisId = scanResult.data?.id

    if (!analysisId) {
      throw new Error('No analysis ID returned from VirusTotal')
    }

    console.log('📊 VirusTotal analysis ID:', analysisId)

    // Wait for analysis to complete (poll every 5 seconds, max 60 seconds)
    let attempts = 0
    const maxAttempts = 12
    let analysisComplete = false
    let analysisData: any = null

    while (!analysisComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      attempts++

      const analysisResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            'x-apikey': VIRUSTOTAL_API_KEY!,
          },
        }
      )

      if (analysisResponse.ok) {
        analysisData = await analysisResponse.json()
        const status = analysisData.data?.attributes?.status

        if (status === 'completed') {
          analysisComplete = true
        }
      }
    }

    if (!analysisComplete) {
      console.warn('⏰ Virus scan timed out (60 seconds)')
      return NextResponse.json({
        success: true,
        timeout: true,
        message: 'Scan timed out but file allowed'
      })
    }

    // Check scan results
    const stats = analysisData.data?.attributes?.stats
    const malicious = stats?.malicious || 0
    const suspicious = stats?.suspicious || 0

    console.log('📋 Scan results:', {
      malicious,
      suspicious,
      harmless: stats?.harmless || 0,
      undetected: stats?.undetected || 0,
    })

    // If any malicious or suspicious detections, reject file
    if (malicious > 0 || suspicious > 0) {
      console.error('🚨 MALICIOUS FILE DETECTED!')
      return NextResponse.json(
        {
          success: false,
          error: 'File failed security scan - potential threat detected',
          report: {
            malicious,
            suspicious,
          },
        },
        { status: 400 }
      )
    }

    // File is clean
    console.log('✅ File scan passed - no threats detected')
    return NextResponse.json({
      success: true,
      clean: true,
      report: {
        malicious: 0,
        suspicious: 0,
        harmless: stats?.harmless || 0,
        undetected: stats?.undetected || 0,
      },
    })

  } catch (error: any) {
    console.error('❌ Virus scan error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to scan file',
      },
      { status: 500 }
    )
  }
}