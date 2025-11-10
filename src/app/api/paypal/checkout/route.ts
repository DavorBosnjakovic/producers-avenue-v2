// File: route.ts
// Path: /src/app/api/paypal/checkout/route.ts
// PayPal checkout order creation API route

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price, 0)

    // Create PayPal order items
    const paypalItems = items.map((item: any) => ({
      name: item.title,
      description: `${item.type === 'product' ? 'Product' : 'Service'} purchase`,
      unit_amount: {
        currency_code: 'USD',
        value: item.price.toFixed(2),
      },
      quantity: '1',
    }))

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: totalAmount.toFixed(2),
                },
              },
            },
            items: paypalItems,
            description: 'Producers Avenue Purchase',
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
          brand_name: 'Producers Avenue',
          user_action: 'PAY_NOW',
        },
        // Store metadata for webhook processing
        purchase_units: [
          {
            reference_id: user.id,
            custom_id: JSON.stringify(items.map((item: any) => ({
              id: item.id,
              type: item.type,
              seller_id: item.seller_id,
              price: item.price,
            }))),
            amount: {
              currency_code: 'USD',
              value: totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: totalAmount.toFixed(2),
                },
              },
            },
            items: paypalItems,
          },
        ],
      }),
    })

    const orderData = await orderResponse.json()

    if (!orderResponse.ok) {
      console.error('PayPal order creation failed:', orderData)
      return NextResponse.json(
        { error: orderData.message || 'Failed to create PayPal order' },
        { status: 500 }
      )
    }

    // Return the order ID and approval URL
    const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href

    return NextResponse.json({
      orderId: orderData.id,
      approvalUrl,
    })
  } catch (error: any) {
    console.error('PayPal checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal checkout' },
      { status: 500 }
    )
  }
}