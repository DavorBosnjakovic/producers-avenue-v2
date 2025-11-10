// File: page.tsx
// Path: /src/app/(protected)/orders/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Package, 
  Calendar, 
  CreditCard,
  User,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrderDetails();
  }, [params.id]);

  async function loadOrderDetails() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch order with related data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          products:product_id(id, name, slug, image_url, description, category, file_size, file_type),
          services:service_id(id, name, slug, image_url, description, category),
          seller:seller_id(id, username, full_name, avatar_url, email),
          buyer:buyer_id(id, username, full_name, avatar_url)
        `)
        .eq('id', params.id)
        .single();

      if (orderError) throw orderError;

      // Verify user is buyer or seller
      if (orderData.buyer_id !== session.user.id && orderData.seller_id !== session.user.id) {
        router.push('/orders');
        return;
      }

      setOrder(orderData);

      // If buyer and it's a digital product, get download info
      if (orderData.buyer_id === session.user.id && orderData.product_id) {
        const { data: downloadData } = await supabase
          .from('product_downloads')
          .select('*')
          .eq('order_id', orderData.id)
          .eq('buyer_id', session.user.id)
          .single();

        setDownloadInfo(downloadData);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error loading order:', err);
      setError('Order not found');
      setLoading(false);
    }
  }

  async function handleDownload() {
    try {
      setDownloading(true);
      
      const response = await fetch(`/api/products/download/${order.product_id}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }

      const data = await response.json();
      
      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank');
      
      // Refresh download info
      await loadOrderDetails();
      
      setDownloading(false);
    } catch (err: any) {
      console.error('Download error:', err);
      alert(err.message || 'Failed to download file');
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/orders"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const item = order.products || order.services;
  const itemType = order.product_id ? 'product' : 'service';
  const isDigital = order.product_id;
  const isBuyer = order.buyer_id === order.buyer?.id;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  const paymentStatusColors: Record<string, string> = {
    paid: 'text-green-600 dark:text-green-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    failed: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || statusColors.pending}`}>
                {order.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4" />
            <span className="text-gray-600 dark:text-gray-400">Payment:</span>
            <span className={`font-semibold ${paymentStatusColors[order.payment_status] || ''}`}>
              {order.payment_status?.toUpperCase()}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400 capitalize">
              {order.payment_method}
            </span>
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Details
          </h2>

          <div className="flex gap-4">
            {item?.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
              />
            )}
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {order.item_name || item?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                {itemType} • {item?.category}
              </p>
              {item?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${((order.total_amount || 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Download Section (for buyers with digital products) */}
        {isBuyer && isDigital && downloadInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Download Files
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Downloads Remaining:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {downloadInfo.downloads_remaining} of 5
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(downloadInfo.expires_at).toLocaleDateString()}
                </span>
              </div>

              {item?.file_size && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">File Size:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(item.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={downloading || downloadInfo.downloads_remaining <= 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold mt-4"
              >
                {downloading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Preparing Download...
                  </>
                ) : downloadInfo.downloads_remaining <= 0 ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Download Limit Reached
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Files
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Parties Involved */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Seller */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">SELLER</h3>
            <Link 
              href={`/profile/${order.seller?.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              {order.seller?.avatar_url ? (
                <img
                  src={order.seller.avatar_url}
                  alt={order.seller.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.seller?.full_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{order.seller?.username}
                </p>
              </div>
            </Link>
            {!isBuyer && (
              <Link
                href={`/messages?user=${order.buyer?.username}`}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Message Buyer
              </Link>
            )}
          </div>

          {/* Buyer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">BUYER</h3>
            <Link 
              href={`/profile/${order.buyer?.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              {order.buyer?.avatar_url ? (
                <img
                  src={order.buyer.avatar_url}
                  alt={order.buyer.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.buyer?.full_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{order.buyer?.username}
                </p>
              </div>
            </Link>
            {isBuyer && (
              <Link
                href={`/messages?user=${order.seller?.username}`}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Message Seller
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}