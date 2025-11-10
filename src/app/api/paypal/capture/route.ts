// File: route.ts
// Path: /src/app/api/paypal/capture/route.ts
// PayPal order capture (payment completion)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // TODO: Capture PayPal order
    // Uncomment when ready to use PayPal
    /*
    const paypal = require('@paypal/checkout-server-sdk')

    // PayPal environment
    const environment = process.env.PAYPAL_MODE === 'production'
      ? new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET
        )
      : new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET
        )

    const client = new paypal.core.PayPalHttpClient(environment)

    // Capture order
    const request = new paypal.orders.OrdersCaptureRequest(orderId)
    request.requestBody({})

    const response = await client.execute(request)
    const capturedOrder = response.result

    if (capturedOrder.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Parse custom data
    const customData = JSON.parse(
      capturedOrder.purchase_units[0].custom_id
    )
    const userId = customData.userId
    const items = customData.items

    // Create orders for each item
    for (const item of items) {
      // Get item details
      let itemTitle = ''
      if (item.itemType === 'product') {
        const { data: product } = await supabase
          .from('products')
          .select('title')
          .eq('id', item.itemId)
          .single()
        itemTitle = product?.title || 'Product'
      } else {
        const { data: service } = await supabase
          .from('services')
          .select('title')
          .eq('id', item.itemId)
          .single()
        itemTitle = service?.title || 'Service'
      }

      const orderData = {
        buyer_id: userId,
        seller_id: item.sellerId,
        [item.itemType === 'product' ? 'product_id' : 'service_id']: item.itemId,
        [item.itemType === 'product' ? 'product_title' : 'service_title']: itemTitle,
        amount: parseFloat(capturedOrder.purchase_units[0].amount.value),
        status: 'completed',
        payment_status: 'paid',
        payment_method: 'paypal',
        payment_intent_id: capturedOrder.id,
        created_at: new Date().toISOString(),
      }

      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderData)

      if (orderError) {
        console.error('Error creating order:', orderError)
        continue
      }

      // Create buyer transaction
      const buyerTransactionData = {
        user_id: userId,
        type: 'purchase',
        amount: -parseFloat(capturedOrder.purchase_units[0].amount.value),
        description: `Purchased: ${itemTitle}`,
        status: 'completed',
        created_at: new Date().toISOString(),
      }

      await supabase.from('transactions').insert(buyerTransactionData)

      // Create seller transaction (95% after 5% platform fee)
      const amount = parseFloat(capturedOrder.purchase_units[0].amount.value)
      const sellerAmount = amount * 0.95

      const sellerTransactionData = {
        user_id: item.sellerId,
        type: 'sale',
        amount: sellerAmount,
        description: `Sale: ${itemTitle}`,
        status: 'pending', // Pending until withdrawal period
        created_at: new Date().toISOString(),
      }

      await supabase.from('transactions').insert(sellerTransactionData)

      // Send notification to seller
      const notificationData = {
        user_id: item.sellerId,
        type: 'order',
        title: 'New Order!',
        message: `You have a new order for "${itemTitle}"`,
        link: '/orders',
        is_read: false,
        created_at: new Date().toISOString(),
      }

      await supabase.from('notifications').insert(notificationData)

      // TODO: Send email notifications
      // await sendOrderConfirmationEmail(buyer)
      // await sendNewSaleEmail(seller)
    }

    // Clear buyer's cart
    await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      orderId: capturedOrder.id,
    })
    */

    // Mock response for development
    console.log('Would capture PayPal order:', orderId)

    return NextResponse.json({
      success: true,
      orderId,
    })
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET request (redirect from PayPal)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token') // PayPal order ID

  if (!token) {
    return NextResponse.redirect('/cart?error=missing_token')
  }

  // Redirect to frontend to handle capture
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/orders?paypal_token=${token}`
  )
}