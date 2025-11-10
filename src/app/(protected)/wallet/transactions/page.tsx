// File: page.tsx
// Path: /src/app/(protected)/wallet/transactions/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { ArrowLeft, Filter, Download, Search, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

type TransactionType = 'all' | 'sale' | 'payout' | 'refund' | 'commission';
type TransactionStatus = 'all' | 'completed' | 'pending' | 'failed';

export default function TransactionsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, typeFilter, statusFilter, searchQuery, dateFrom, dateTo]);

  async function loadTransactions() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select(`
          *,
          buyer:buyer_id(username, full_name),
          seller:seller_id(username, full_name),
          product:product_id(name),
          service:service_id(name)
        `)
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(transactionsData || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...transactions];

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => {
        const searchLower = searchQuery.toLowerCase();
        return (
          t.product?.name?.toLowerCase().includes(searchLower) ||
          t.service?.name?.toLowerCase().includes(searchLower) ||
          t.buyer?.username?.toLowerCase().includes(searchLower) ||
          t.seller?.username?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Date filters
    if (dateFrom) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.created_at) <= endDate);
    }

    setFilteredTransactions(filtered);
  }

  function clearFilters() {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  }

  function exportTransactions() {
    // Create CSV content
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Commission', 'Net Amount', 'Status', 'Payment Method'];
    const rows = filteredTransactions.map(t => [
      new Date(t.created_at).toLocaleString(),
      t.transaction_type,
      t.product?.name || t.service?.name || 'N/A',
      `$${(t.amount / 100).toFixed(2)}`,
      `$${(t.commission / 100).toFixed(2)}`,
      `$${(t.net_amount / 100).toFixed(2)}`,
      t.status,
      t.payment_method,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalEarned = filteredTransactions
    .filter(t => t.transaction_type === 'sale')
    .reduce((sum, t) => sum + (t.net_amount || 0), 0) / 100;

  const totalPaid = filteredTransactions
    .filter(t => t.transaction_type === 'payout')
    .reduce((sum, t) => sum + (t.amount || 0), 0) / 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wallet
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {filteredTransactions.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${totalEarned.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Withdrawn</p>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              ${totalPaid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
            <button
              onClick={exportTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="sale">Sales</option>
              <option value="payout">Payouts</option>
              <option value="refund">Refunds</option>
              <option value="commission">Commissions</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date From */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />

            {/* Date To */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Net</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 capitalize">
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {transaction.product?.name || transaction.service?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ${(transaction.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                        ${(transaction.net_amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {transaction.payment_method}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}