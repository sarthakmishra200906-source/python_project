import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const PAGE_SIZE = 10;

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [page,         setPage]         = useState(1);
  const [filter,       setFilter]       = useState('All');  // All | Success | Pending | Failed

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/history/${user.id}`);
        setTransactions(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user.id]);

  const filtered = filter === 'All'
    ? transactions
    : transactions.filter((t) => t.status === filter);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f) => { setFilter(f); setPage(1); };

  const statusBadge = (status) => ({
    Success: 'badge-success',
    Failed:  'badge-error',
    Pending: 'badge-warning',
  }[status] || 'badge-brand');

  // Summary stats
  const totalSpent   = transactions.filter((t) => t.status === 'Success').reduce((s, t) => s + t.amount, 0);
  const successCount = transactions.filter((t) => t.status === 'Success').length;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading transaction history…" />
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-20 p-6 text-center glass-card">
      <p className="text-red-500 dark:text-red-400 mb-4">⚠️ {error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
            Transaction <span className="gradient-text">History</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">All your past recharges in one place.</p>
        </div>

        {/* ── Summary stats ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Recharges', value: successCount,              icon: '🔄', color: 'border-brand-400' },
            { label: 'Total Spent',     value: `₹${totalSpent.toFixed(0)}`, icon: '💸', color: 'border-emerald-400' },
            { label: 'All Records',     value: transactions.length,       icon: '📋', color: 'border-violet-400' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`glass-card p-4 flex items-center gap-4 border-l-4 ${color}`}>
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ──────────────────────────────────── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['All', 'Success', 'Pending', 'Failed'].map((f) => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200
                ${filter === f
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'
                }`}
            >
              {f}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${filter === f ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {f === 'All' ? transactions.length : transactions.filter((t) => t.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ───────────────────────────────────────── */}
        <div className="glass-card overflow-hidden">
          {paged.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <div className="text-5xl mb-4">📭</div>
              <p className="font-medium">No transactions yet</p>
              <Link to="/plans" className="btn-primary mt-4 inline-flex" id="no-history-recharge-btn">
                Recharge Now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="text-left px-6 py-4 font-semibold">Transaction ID</th>
                    <th className="text-left px-6 py-4 font-semibold">Plan</th>
                    <th className="text-left px-6 py-4 font-semibold hidden md:table-cell">Category</th>
                    <th className="text-left px-6 py-4 font-semibold hidden sm:table-cell">Data</th>
                    <th className="text-left px-6 py-4 font-semibold hidden lg:table-cell">Date & Time</th>
                    <th className="text-right px-6 py-4 font-semibold">Amount</th>
                    <th className="text-right px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {paged.map((tx, i) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {tx.transaction_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {tx.plan_name}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="badge badge-brand text-xs">{tx.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                        {tx.data}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell text-xs">
                        {new Date(tx.recharged_at).toLocaleString('en-IN', {
                          day:    '2-digit',
                          month:  'short',
                          year:   'numeric',
                          hour:   '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-800 dark:text-slate-200">
                        ₹{tx.amount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`badge ${statusBadge(tx.status)}`}>{tx.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4
              border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold
                    bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                    hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40
                    disabled:cursor-not-allowed transition-colors"
                  id="pagination-prev"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors
                      ${p === page
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    id={`pagination-page-${p}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold
                    bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                    hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40
                    disabled:cursor-not-allowed transition-colors"
                  id="pagination-next"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
