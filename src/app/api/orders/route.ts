// File: route.ts
// Path: /src/app/api/orders/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const type = searchParams.get('type'); // 'purchases' or 'sales'
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get specific order by ID
    if (orderId) {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:user_profiles!orders_user_id_fkey(id, username, email, avatar_url),
          order_items(
            *,
            product:products(id, name, images),
            service:services(id, name, images),
            seller:user_profiles!order_items_seller_id_fkey(id, username, email, avatar_url)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Check if user has permission to view this order
      const isOwner = order.user_id === user.id;
      const isSeller = order.order_items.some((item: any) => item.seller_id === user.id);

      if (!isOwner && !isSeller) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({ order });
    }

    // Get orders list
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          item_name,
          item_price,
          quantity,
          item_type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type === 'purchases') {
      // Get orders where user is the buyer
      query = query.eq('user_id', user.id);
    } else if (type === 'sales') {
      // Get orders where user is the seller (need to join through order_items)
      const { data: salesOrders, error: salesError } = await supabase
        .from('order_items')
        .select(`
          order_id,
          orders(
            *,
            order_items(
              id,
              item_name,
              item_price,
              quantity,
              item_type
            )
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (salesError) throw salesError;

      // Extract unique orders
      const uniqueOrders = Array.from(
        new Map(
          salesOrders
            .map(item => item.orders)
            .filter(order => order !== null)
            .map(order => [order.id, order])
        ).values()
      );

      return NextResponse.json({ orders: uniqueOrders });
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, status, cancel_reason } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        { error: 'order_id and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get the order to verify ownership
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, order_items(seller_id)')
      .eq('id', order_id)
      .single();

    if (fetchError) throw fetchError;

    // Check if user has permission to update this order
    const isOwner = order.user_id === user.id;
    const isSeller = order.order_items.some((item: any) => item.seller_id === user.id);

    if (!isOwner && !isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update order status
    const updateData: any = { status };
    
    if (status === 'cancelled' && cancel_reason) {
      updateData.cancel_reason = cancel_reason;
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create notification for buyer/seller
    const notificationUserId = isOwner ? order.order_items[0].seller_id : order.user_id;
    
    await supabase
      .from('notifications')
      .insert({
        user_id: notificationUserId,
        type: 'order_update',
        title: 'Order Status Updated',
        message: `Order #${order.order_number} status changed to ${status}`,
        link: `/orders/${order_id}`,
        read: false
      });

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}