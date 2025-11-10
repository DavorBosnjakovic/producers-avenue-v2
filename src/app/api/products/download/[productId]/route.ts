// File: route.ts
// Path: /src/app/api/products/download/[productId]/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Product Download Route
 * 
 * Secure file download system with:
 * - Purchase verification
 * - Download limit tracking
 * - Expiration checking
 * - Download counting
 */
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = params;
    const userId = session.user.id;

    // Check if user has purchased this product
    const { data: purchase, error: purchaseError } = await supabase
      .from('product_downloads')
      .select(`
        *,
        products:product_id(
          id,
          name,
          file_url,
          file_size,
          file_type
        ),
        orders:order_id(
          id,
          payment_status
        )
      `)
      .eq('product_id', productId)
      .eq('buyer_id', userId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Product not purchased or download record not found' },
        { status: 403 }
      );
    }

    // Verify order was paid
    if (purchase.orders?.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Order payment not completed' },
        { status: 403 }
      );
    }

    // Check if download has expired
    const now = new Date();
    const expiresAt = new Date(purchase.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 410 }
      );
    }

    // Check download limit
    if (purchase.downloads_remaining <= 0) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 429 }
      );
    }

    // Get product file URL from Supabase Storage
    const product = purchase.products;
    
    if (!product || !product.file_url) {
      return NextResponse.json(
        { error: 'Product file not found' },
        { status: 404 }
      );
    }

    // Generate signed URL for secure download (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('product-files')
      .createSignedUrl(product.file_url, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      );
    }

    // Update download tracking
    const { error: updateError } = await supabase
      .from('product_downloads')
      .update({
        downloads_remaining: purchase.downloads_remaining - 1,
        last_downloaded_at: new Date().toISOString(),
        download_count: (purchase.download_count || 0) + 1,
      })
      .eq('id', purchase.id);

    if (updateError) {
      console.error('Error updating download count:', updateError);
      // Continue anyway - don't block download
    }

    // Log download activity
    await supabase.from('download_logs').insert({
      user_id: userId,
      product_id: productId,
      download_id: purchase.id,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      downloaded_at: new Date().toISOString(),
    });

    // Return download info
    return NextResponse.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      fileName: product.name,
      fileSize: product.file_size,
      fileType: product.file_type,
      downloadsRemaining: purchase.downloads_remaining - 1,
      expiresAt: purchase.expires_at,
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}

/**
 * Refresh expired download link
 * POST /api/products/download/[productId]
 */
export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = params;
    const userId = session.user.id;

    // Get purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('product_downloads')
      .select('*')
      .eq('product_id', productId)
      .eq('buyer_id', userId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Product not purchased' },
        { status: 403 }
      );
    }

    // Check if still has downloads remaining
    if (purchase.downloads_remaining <= 0) {
      return NextResponse.json(
        { error: 'No downloads remaining' },
        { status: 429 }
      );
    }

    // Extend expiration by 30 days
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    const { error: updateError } = await supabase
      .from('product_downloads')
      .update({
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('id', purchase.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Download link extended',
      expiresAt: newExpiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Refresh download error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh download' },
      { status: 500 }
    );
  }
}