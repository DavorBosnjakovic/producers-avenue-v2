// File: route.ts
// Path: /src/app/api/stripe/webhook/route.ts
// Stripe webhook handler for payment events

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract metadata
        const userId = session.metadata?.user_id
        const itemsJson = session.metadata?.items

        if (!userId || !itemsJson) {
          console.error('Missing metadata in session')
          break
        }

        const items = JSON.parse(itemsJson)

        // Create orders for each item
        for (const item of items) {
          const orderData: any = {
            buyer_id: userId,
            seller_id: item.seller_id,
            amount: item.price,
            status: 'completed',
            payment_method: 'stripe',
            payment_id: session.payment_intent as string,
            created_at: new Date().toISOString(),
          }

          // Add product or service ID
          if (item.type === 'product') {
            orderData.product_id = item.id
            
            // Get product title
            const { data: product } = await supabase
              .from('products')
              .select('title')
              .eq('id', item.id)
              .single()
            
            if (product) {
              orderData.product_title = product.title
            }
          } else {
            orderData.service_id = item.id
            
            // Get service title
            const { data: service } = await supabase
              .from('services')
              .select('title')
              .eq('id', item.id)
              .single()
            
            if (service) {
              orderData.service_title = service.title
            }
          }

          // Insert order
          const { error: orderError } = await supabase
            .from('orders')
            .insert(orderData)

          if (orderError) {
            console.error('Error creating order:', orderError)
            continue
          }

          // Create transaction record
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              user_id: item.seller_id,
              type: 'sale',
              amount: item.price,
              status: 'completed',
              description: `Sale of ${item.type}: ${orderData[item.type === 'product' ? 'product_title' : 'service_title']}`,
              created_at: new Date().toISOString(),
            })

          if (transactionError) {
            console.error('Error creating transaction:', transactionError)
          }

          // Create notification for seller
          await supabase
            .from('notifications')
            .insert({
              user_id: item.seller_id,
              type: 'order',
              title: 'New Order!',
              message: `You have a new order for ${orderData[item.type === 'product' ? 'product_title' : 'service_title']}`,
              link: '/orders',
              is_read: false,
              created_at: new Date().toISOString(),
            })

          // Create notification for buyer
          await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'order',
              title: 'Order Confirmed!',
              message: `Your order for ${orderData[item.type === 'product' ? 'product_title' : 'service_title']} has been confirmed`,
              link: '/orders',
              is_read: false,
              created_at: new Date().toISOString(),
            })
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        // Handle failed payment (send notification, etc.)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}