// File: page.tsx
// Path: /src/app/(protected)/wallet/payout/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { ArrowLeft, DollarSign, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export default function PayoutRequestPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [payoutMethod, setPayoutMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const MINIMUM_PAYOUT = 50; // $50 minimum

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (walletError) throw walletError;

      setWallet(walletData);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading wallet:', err);
      setError('Failed to load wallet');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payoutAmount = parseFloat(amount);

      // Validation
      if (isNaN(payoutAmount) || payoutAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (payoutAmount < MINIMUM_PAYOUT) {
        throw new Error(`Minimum payout is $${MINIMUM_PAYOUT}`);
      }

      const availableBalance = wallet.balance_available / 100;
      if (payoutAmount > availableBalance) {
        throw new Error('Insufficient available balance');
      }

      // Check if payout method is configured
      if (payoutMethod === 'stripe' && !wallet.stripe_account_id) {
        throw new Error('Please connect your Stripe account in wallet settings');
      }

      if (payoutMethod === 'paypal' && !wallet.paypal_email) {
        throw new Error('Please add your PayPal email in wallet settings');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Create payout request
      const { error: payoutError } = await supabase
        .from('payouts')
        .insert({
          user_id: session.user.id,
          wallet_id: wallet.id,
          amount: Math.round(payoutAmount * 100), // Convert to cents
          payout_method: payoutMethod,
          status: 'pending',
          requested_at: new Date().toISOString(),
        });

      if (payoutError) throw payoutError;

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/wallet');
      }, 2000);
    } catch (err: any) {
      console.error('Payout request error:', err);
      setError(err.message || 'Failed to request payout');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payout Requested!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your payout request has been submitted and will be processed within 1-3 business days.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to wallet...
          </p>
        </div>
      </div>
    );
  }

  const availableBalance = wallet.balance_available / 100;
  const canRequestPayout = availableBalance >= MINIMUM_PAYOUT;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wallet
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Request Payout
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Withdraw your available earnings
            </p>
          </div>

          {/* Available Balance */}
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${availableBalance.toFixed(2)}
            </p>
            {wallet.balance_pending > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                ${(wallet.balance_pending / 100).toFixed(2)} pending (7-day escrow hold)
              </p>
            )}
          </div>

          {!canRequestPayout ? (
            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                      Minimum Payout Not Met
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      You need at least ${MINIMUM_PAYOUT} in available balance to request a payout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Payout Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Payout Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    payoutMethod === 'stripe' 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }">
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="stripe"
                      checked={payoutMethod === 'stripe'}
                      onChange={(e) => setPayoutMethod(e.target.value as 'stripe')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">Stripe</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {wallet.stripe_account_id 
                          ? 'Bank account connected • 2-3 business days' 
                          : '⚠️ Not connected - configure in settings'}
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    payoutMethod === 'paypal' 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="paypal"
                      checked={payoutMethod === 'paypal'}
                      onChange={(e) => setPayoutMethod(e.target.value as 'paypal')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">PayPal</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {wallet.paypal_email 
                          ? `${wallet.paypal_email} • Instant` 
                          : '⚠️ Not connected - configure in settings'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payout Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={MINIMUM_PAYOUT}
                    max={availableBalance}
                    step="0.01"
                    required
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`${MINIMUM_PAYOUT}.00`}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toFixed(2))}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Withdraw All
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Min: ${MINIMUM_PAYOUT} • Max: ${availableBalance.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                  Important Information
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Payouts are processed automatically within 1-3 business days</li>
                  <li>• Stripe payouts arrive in 2-3 business days</li>
                  <li>• PayPal payouts are instant</li>
                  <li>• No fees charged by Producers Avenue</li>
                  <li>• You'll receive an email confirmation</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    Request Payout
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}