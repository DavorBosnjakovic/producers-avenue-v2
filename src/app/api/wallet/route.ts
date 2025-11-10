// File: route.ts
// Path: /src/app/api/wallet/route.ts

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
    const type = searchParams.get('type'); // 'balance', 'transactions', 'pending'

    if (type === 'balance') {
      // Get wallet balance
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // If wallet doesn't exist, create it
      if (!wallet) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance: 0,
            pending_balance: 0,
            total_earned: 0,
            total_withdrawn: 0
          })
          .select()
          .single();

        if (createError) throw createError;

        return NextResponse.json({ wallet: newWallet });
      }

      return NextResponse.json({ wallet });
    }

    if (type === 'transactions') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const transactionType = searchParams.get('transaction_type');

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (transactionType) {
        query = query.eq('type', transactionType);
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      return NextResponse.json({ transactions });
    }

    if (type === 'pending') {
      // Get pending earnings (orders that are completed but not yet available for withdrawal)
      const { data: pendingOrders, error } = await supabase
        .from('order_items')
        .select(`
          id,
          item_price,
          quantity,
          orders!inner(
            id,
            status,
            payment_status,
            created_at
          )
        `)
        .eq('seller_id', user.id)
        .in('orders.status', ['completed', 'processing'])
        .eq('orders.payment_status', 'paid');

      if (error) throw error;

      // Calculate pending amount (items from last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const pendingAmount = pendingOrders
        .filter(item => new Date(item.orders.created_at) > sevenDaysAgo)
        .reduce((sum, item) => sum + (item.item_price * item.quantity), 0);

      return NextResponse.json({ 
        pending_amount: pendingAmount,
        pending_items: pendingOrders.length
      });
    }

    // Default: return wallet summary
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ 
      wallet: wallet || null,
      recent_transactions: recentTransactions || []
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, amount, payout_method, payout_details } = body;

    if (action === 'request_payout') {
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount' },
          { status: 400 }
        );
      }

      if (!payout_method || !payout_details) {
        return NextResponse.json(
          { error: 'Payout method and details are required' },
          { status: 400 }
        );
      }

      // Get wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw walletError;

      // Check if sufficient balance
      if (wallet.balance < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Minimum payout amount check
      const MIN_PAYOUT = 10.00;
      if (amount < MIN_PAYOUT) {
        return NextResponse.json(
          { error: `Minimum payout amount is $${MIN_PAYOUT}` },
          { status: 400 }
        );
      }

      // Create payout request
      const { data: payout, error: payoutError } = await supabase
        .from('payouts')
        .insert({
          user_id: user.id,
          amount: amount,
          status: 'pending',
          payout_method: payout_method,
          payout_details: payout_details
        })
        .select()
        .single();

      if (payoutError) throw payoutError;

      // Update wallet balance (move to pending)
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: wallet.balance - amount,
          pending_balance: wallet.pending_balance + amount
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'payout_request',
          amount: -amount,
          status: 'pending',
          description: `Payout request via ${payout_method}`,
          reference_id: payout.id
        });

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'payout',
          title: 'Payout Request Submitted',
          message: `Your payout request for $${amount.toFixed(2)} is being processed`,
          link: '/wallet/transactions',
          read: false
        });

      return NextResponse.json({ 
        success: true,
        payout,
        message: 'Payout request submitted successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing wallet action:', error);
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
    const { payout_id, action } = body;

    if (!payout_id || !action) {
      return NextResponse.json(
        { error: 'payout_id and action are required' },
        { status: 400 }
      );
    }

    // Get payout details
    const { data: payout, error: fetchError } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payout_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    if (action === 'cancel' && payout.status === 'pending') {
      // Cancel payout request
      const { error: cancelError } = await supabase
        .from('payouts')
        .update({ status: 'cancelled' })
        .eq('id', payout_id);

      if (cancelError) throw cancelError;

      // Return funds to available balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      await supabase
        .from('wallets')
        .update({
          balance: wallet.balance + payout.amount,
          pending_balance: wallet.pending_balance - payout.amount
        })
        .eq('user_id', user.id);

      // Update transaction
      await supabase
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('reference_id', payout_id)
        .eq('type', 'payout_request');

      return NextResponse.json({ 
        success: true,
        message: 'Payout cancelled successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or payout status' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating payout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}