// File: route.ts
// Path: /src/app/api/paypal/webhook/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * PayPal Webhook Handler
 * 
 * Handles webhook events from PayPal:
 * - PAYMENT.CAPTURE.COMPLETED - Payment captured successfully
 * - PAYMENT.CAPTURE.DENIED - Payment failed
 * - PAYMENT.CAPTURE.REFUNDED - Payment refunded
 */
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get webhook payload and headers
    const body = await req.text();
    const headers = {
      'paypal-transmission-id': req.headers.get('paypal-transmission-id') || '',
      'paypal-transmission-time': req.headers.get('paypal-transmission-time') || '',
      'paypal-transmission-sig': req.headers.get('paypal-transmission-sig') || '',
      'paypal-cert-url': req.headers.get('paypal-cert-url') || '',
      'paypal-auth-algo': req.headers.get('paypal-auth-algo') || '',
    };

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(body, headers);
    
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;

    console.log(`Processing PayPal webhook: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptured(event, supabase);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(event, supabase);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(event, supabase);
        break;

      default:
        console.log(`Unhandled PayPal webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Verify PayPal webhook signature
 */
async function verifyPayPalWebhook(
  body: string,
  headers: Record<string, string>
): Promise<boolean> {
  try {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
    const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
    
    const PAYPAL_API_BASE = PAYPAL_MODE === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !PAYPAL_WEBHOOK_ID) {
      throw new Error('PayPal credentials not configured');
    }

    // Get access token
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const { access_token } = await tokenResponse.json();

    // Verify webhook signature
    const verifyResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transmission_id: headers['paypal-transmission-id'],
          transmission_time: headers['paypal-transmission-time'],
          cert_url: headers['paypal-cert-url'],
          auth_algo: headers['paypal-auth-algo'],
          transmission_sig: headers['paypal-transmission-sig'],
          webhook_id: PAYPAL_WEBHOOK_ID,
          webhook_event: JSON.parse(body),
        }),
      }
    );

    if (!verifyResponse.ok) {
      return false;
    }

    const verifyData = await verifyResponse.json();
    return verifyData.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(event: any, supabase: any) {
  const captureId = event.resource.id;
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;

  console.log(`Payment captured - Order ID: ${orderId}, Capture ID: ${captureId}`);

  // Find transactions with this PayPal order ID
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('paypal_order_id', orderId);

  if (txError || !transactions || transactions.length === 0) {
    console.error('No transactions found for order:', orderId);
    return;
  }

  // Update all related transactions
  for (const transaction of transactions) {
    // Update transaction with capture ID
    await supabase
      .from('transactions')
      .update({
        paypal_capture_id: captureId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    // Update order status
    if (transaction.order_id) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.order_id);
    }
  }

  console.log(`Updated ${transactions.length} transactions for order ${orderId}`);
}

/**
 * Handle denied/failed payment
 */
async function handlePaymentDenied(event: any, supabase: any) {
  const captureId = event.resource.id;
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;

  console.log(`Payment denied - Order ID: ${orderId}, Capture ID: ${captureId}`);

  // Find transactions with this PayPal order ID
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('paypal_order_id', orderId);

  if (!transactions || transactions.length === 0) {
    console.error('No transactions found for order:', orderId);
    return;
  }

  // Update all related transactions
  for (const transaction of transactions) {
    // Update transaction as failed
    await supabase
      .from('transactions')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    // Update order status
    if (transaction.order_id) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.order_id);
    }

    // Notify buyer
    if (transaction.buyer_id) {
      await supabase.from('notifications').insert({
        user_id: transaction.buyer_id,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Your PayPal payment was declined. Please try again.',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  console.log(`Marked ${transactions.length} transactions as failed for order ${orderId}`);
}

/**
 * Handle refunded payment
 */
async function handlePaymentRefunded(event: any, supabase: any) {
  const captureId = event.resource.id;
  const refundAmount = parseFloat(event.resource.amount.value);

  console.log(`Payment refunded - Capture ID: ${captureId}, Amount: $${refundAmount}`);

  // Find transaction with this capture ID
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('paypal_capture_id', captureId)
    .single();

  if (!transaction) {
    console.error('No transaction found for capture:', captureId);
    return;
  }

  // Create refund transaction
  await supabase.from('transactions').insert({
    buyer_id: transaction.buyer_id,
    seller_id: transaction.seller_id,
    order_id: transaction.order_id,
    product_id: transaction.product_id,
    service_id: transaction.service_id,
    amount: -Math.round(refundAmount * 100), // Negative amount for refund
    commission: 0,
    net_amount: -Math.round(refundAmount * 100),
    transaction_type: 'refund',
    payment_method: 'paypal',
    payment_processor: 'paypal',
    paypal_capture_id: captureId,
    status: 'completed',
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  // Update original transaction
  await supabase
    .from('transactions')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
    })
    .eq('id', transaction.id);

  // Update order
  if (transaction.order_id) {
    await supabase
      .from('orders')
      .update({
        status: 'refunded',
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.order_id);
  }

  // Deduct from seller's wallet
  const refundCents = Math.round(refundAmount * 100);
  await supabase.rpc('update_seller_wallet', {
    p_seller_id: transaction.seller_id,
    p_amount: -refundCents,
    p_payment_method: 'paypal',
    p_transaction_type: 'refund',
  });

  // Notify both parties
  await supabase.from('notifications').insert([
    {
      user_id: transaction.buyer_id,
      type: 'refund_processed',
      title: 'Refund Processed',
      message: `Your refund of $${refundAmount.toFixed(2)} has been processed.`,
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      user_id: transaction.seller_id,
      type: 'refund_issued',
      title: 'Refund Issued',
      message: `A refund of $${refundAmount.toFixed(2)} was issued for your sale.`,
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ]);

  console.log(`Processed refund for transaction ${transaction.id}`);
}