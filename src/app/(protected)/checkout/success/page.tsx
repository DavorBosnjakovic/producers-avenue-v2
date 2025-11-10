// File: page.tsx
// Path: /src/app/(protected)/checkout/success/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { CheckCircle, Package, Download, ArrowRight, Loader2, Clock } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const sessionId = searchParams.get('session_id'); // Stripe
  const token = searchParams.get('token'); // PayPal
  const paymentMethod = sessionId ? 'stripe' : 'paypal';

  useEffect(() => {
    verifyPaymentAndFetchOrders();
  }, []);

  async function verifyPaymentAndFetchOrders() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch recent orders (last 10 minutes to account for webhook delays)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      const { data: recentOrders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          products:product_id(id, name, slug, image_url),
          services:service_id(id, name, slug, image_url),
          seller:seller_id(username, full_name, avatar_url)
        `)
        .eq('buyer_id', session.user.id)
        .eq('payment_status', 'paid')
        .gte('created_at', tenMinutesAgo)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(recentOrders || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Unable to load order details');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Processing your order...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/orders"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View Orders
            </Link>
            <Link
              href="/marketplace"
              className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / 100;
  const hasDigitalProducts = orders.some(order => order.product_id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          <div className="inline-block bg-gray-100 dark:bg-gray-700 rounded-lg px-6 py-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalAmount.toFixed(2)}
            </p>
          </div>

          {paymentMethod === 'stripe' && sessionId && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Payment Method: Credit Card (Stripe)
            </p>
          )}
          {paymentMethod === 'paypal' && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Payment Method: PayPal
            </p>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Your Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Your orders are being processed...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Please check your orders page in a few moments, or check your email for confirmation.
              </p>
              <Link
                href="/orders"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Orders
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const item = order.products || order.services;
                const itemType = order.product_id ? 'product' : 'service';
                const isDigital = order.product_id;
                
                return (
                  <div
                    key={order.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    {item?.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {order.item_name || item?.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {itemType} by @{order.seller?.username}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        ${((order.total_amount || 0) / 100).toFixed(2)}
                      </p>
                      {isDigital && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          Ready to download
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                    >
                      View Order
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            What's Next?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Check Your Email
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent order confirmation and {hasDigitalProducts ? 'download links' : 'details'} to your email.
                </p>
              </div>
            </div>

            {hasDigitalProducts && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Download Your Files
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access your purchases from the Orders page. You have 5 downloads per product, valid for 30 days.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold">{hasDigitalProducts ? '3' : '2'}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {hasDigitalProducts ? 'Leave a Review' : 'Seller Will Contact You'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {hasDigitalProducts 
                    ? 'Help other creators by sharing your experience with this product.'
                    : 'For service orders, the seller will reach out to discuss project details and requirements.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/orders"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            View All Orders
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            href="/marketplace"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}