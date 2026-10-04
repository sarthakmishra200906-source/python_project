import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentModal from '../components/PaymentModal';
import {
  DataUsageChart,
  MonthlySpendingChart,
  DataTrendChart,
} from '../components/charts/ChartComponents';

// ── Stat card ──────────────────────────────────────────────────
function InfoCard({ icon, label, value, sub, color }) {
  return (
    <div className={`glass-card p-5 flex items-start gap-4 border-l-4 ${color}`}>
      <div className="text-3xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-black text-slate-800 dark:text-slate-100 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Chart wrapper ──────────────────────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [dashData,  setDashData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentPin, setPaymentPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [resetPinOpen, setResetPinOpen] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Recent transactions (last 5) from dashboard data
  const [recentTx, setRecentTx] = useState([]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, histRes] = await Promise.all([
        apiClient.get(`/dashboard/${user.id}`),
        apiClient.get(`/history/${user.id}`),
      ]);
      setDashData(dashRes.data);
      setRecentTx(histRes.data.slice(0, 5));
      updateUser(dashRes.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []); // eslint-disable-line

  const handleRechargeSuccess = (data) => {
    updateUser(data.user);
    navigate('/payment-success', { state: data });
  };

  const handleSavePin = async (event) => {
    event.preventDefault();
    setPinMessage('');
    if (!/^\d{6}$/.test(paymentPin)) {
      setPinMessage('Payment PIN must contain exactly six digits.');
      return;
    }
    if (paymentPin !== confirmPin) {
      setPinMessage('PIN entries do not match.');
      return;
    }
    setSavingPin(true);
    try {
      await apiClient.post('/auth/payment-pin', { user_id: user.id, pin: paymentPin });
      setPinMessage('Payment PIN saved. You can now complete QR demo payments.');
      setPaymentPin('');
      setConfirmPin('');
      updateUser({ has_payment_pin: true });
    } catch (err) {
      setPinMessage(err.message);
    } finally {
      setSavingPin(false);
    }
  };

  const handleResetPin = async (event) => {
    event.preventDefault();
    setPinMessage('');
    if (!/^\d{6}$/.test(paymentPin) || paymentPin !== confirmPin) {
      setPinMessage('Enter matching six-digit PIN values.');
      return;
    }
    setSavingPin(true);
    try {
      await apiClient.post('/auth/payment-pin/reset', {
        user_id: user.id, phone: resetPhone, password: resetPassword, new_pin: paymentPin,
      });
      setPinMessage('Payment PIN reset successfully.');
      setResetPinOpen(false);
      setPaymentPin(''); setConfirmPin(''); setResetPhone(''); setResetPassword('');
    } catch (err) {
      setPinMessage(err.message);
    } finally {
      setSavingPin(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    if (!window.confirm('Delete your account and all recharge history permanently?')) return;
    setDeleting(true);
    try {
      await apiClient.delete('/auth/account', {
        data: { user_id: user.id, phone: user.phone, password: deletePassword },
      });
      logout();
      navigate('/');
    } catch (err) {
      setPinMessage(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading your dashboard…" />
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-20 p-6 text-center glass-card">
      <p className="text-red-500 dark:text-red-400 mb-4">⚠️ {error}</p>
      <button onClick={fetchDashboard} className="btn-primary">Retry</button>
    </div>
  );

  const u = dashData?.user || user;
  const hasPaymentPin = Boolean(u.has_payment_pin || user.has_payment_pin);
  const monthly = dashData?.monthly_spending || [];

  const dataBalance = Number(u.data_balance || 0);
  const dataTotal   = Number(u.data_total   || 0);
  const dataUsedPct = dataTotal > 0 ? Math.round(((dataTotal - dataBalance) / dataTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── Welcome header ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
              Welcome back, <span className="gradient-text">{u.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              +91 {u.phone} · Member since {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
          <Link to="/plans" className="btn-primary self-start sm:self-auto" id="dashboard-recharge-btn">
            + Quick Recharge
          </Link>
        </div>

        <section className="glass-card p-6" aria-labelledby="payment-pin-title">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">Payment security</p>
              <h2 id="payment-pin-title" className="font-bold text-slate-800 dark:text-slate-100">{hasPaymentPin ? 'Payment PIN is active' : 'Set your six-digit payment PIN'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{hasPaymentPin ? 'Reset it only after verifying your login credentials.' : 'Required before a simulated QR recharge can be completed.'}</p>
            </div>
            {!hasPaymentPin && <form onSubmit={handleSavePin} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <input aria-label="New payment PIN" type="password" inputMode="numeric" maxLength={6}
                value={paymentPin} onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="New 6-digit PIN" className="input-field sm:w-40" />
              <input aria-label="Confirm payment PIN" type="password" inputMode="numeric" maxLength={6}
                value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Confirm PIN" className="input-field sm:w-40" />
              <button type="submit" disabled={savingPin} className="btn-primary whitespace-nowrap">
                {savingPin ? 'Saving…' : 'Save PIN'}
              </button>
            </form>}
            {hasPaymentPin && !resetPinOpen && <button onClick={() => setResetPinOpen(true)} className="btn-secondary">Reset Payment PIN</button>}
          </div>
          {hasPaymentPin && resetPinOpen && <form onSubmit={handleResetPin} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <input aria-label="Login phone for PIN reset" value={resetPhone} onChange={(e) => setResetPhone(e.target.value)} placeholder="Login phone" className="input-field" required />
            <input aria-label="Login password for PIN reset" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Login password" className="input-field" required />
            <input aria-label="New reset PIN" type="password" inputMode="numeric" maxLength={6} value={paymentPin} onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="New 6-digit PIN" className="input-field" required />
            <input aria-label="Confirm reset PIN" type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Confirm PIN" className="input-field" required />
            <button type="submit" disabled={savingPin} className="btn-primary sm:col-span-2 lg:col-span-4">{savingPin ? 'Verifying…' : 'Verify Login & Reset PIN'}</button>
          </form>}
          {pinMessage && <p className="mt-3 text-sm text-brand-600 dark:text-brand-400">{pinMessage}</p>}
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/70 p-6 dark:border-red-900/60 dark:bg-red-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div><h2 className="font-bold text-red-700 dark:text-red-300">Delete account</h2><p className="text-sm text-red-600/80 dark:text-red-300/70 mt-1">Permanently removes your profile and recharge history from MySQL.</p></div>
            {!deleteOpen && <button onClick={() => setDeleteOpen(true)} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30">Delete my account</button>}
          </div>
          {deleteOpen && <form onSubmit={handleDeleteAccount} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Confirm login password" className="input-field sm:max-w-xs" required />
            <button type="submit" disabled={deleting} className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{deleting ? 'Deleting…' : 'Permanently delete'}</button>
            <button type="button" onClick={() => setDeleteOpen(false)} className="btn-secondary">Cancel</button>
          </form>}
        </section>

        {/* ── Account info cards ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard icon="📱" label="Active Plan"    value={u.plan_name}
            sub={`${u.network_type || '4G'} · Currently active`} color="border-brand-400" />
          <InfoCard icon="📅" label="Validity"
            value={u.validity_days > 0 ? `${u.validity_days} days` : 'Expired'}
            sub="Remaining" color="border-emerald-400" />
          <InfoCard icon="📶" label="Data Balance"
            value={dataTotal > 0 ? `${dataBalance.toFixed(1)} GB` : 'N/A'}
            sub={dataTotal > 0 ? `${dataUsedPct}% used of ${dataTotal.toFixed(0)} GB` : 'Recharge to activate'}
            color="border-violet-400" />
          <InfoCard icon="💸" label="Total Spent"
            value={`₹${monthly.reduce((s, m) => s + m.total_amount, 0).toFixed(0)}`}
            sub="Last 6 months" color="border-amber-400" />
        </div>

        {/* ── Charts row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Data usage doughnut */}
          <ChartCard
            title="Data Usage"
            subtitle={dataTotal > 0 ? `${dataBalance.toFixed(1)} GB remaining` : 'No active data plan'}
          >
            <DataUsageChart dataBalance={dataBalance} dataTotal={dataTotal} />
          </ChartCard>

          {/* Monthly spending bar */}
          <ChartCard
            title="Monthly Spending"
            subtitle="Recharge expenditure (last 6 months)"
          >
            <div style={{ height: 200 }}>
              <MonthlySpendingChart monthlyData={monthly} />
            </div>
          </ChartCard>

          {/* Daily trend line */}
          <ChartCard
            title="Data Usage Trend"
            subtitle="Simulated 7-day daily consumption"
          >
            <div style={{ height: 200 }}>
              <DataTrendChart dataTotal={dataTotal} validityDays={u.validity_days || 28} />
            </div>
          </ChartCard>
        </div>

        {/* ── Recent transactions ─────────────────────────── */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">Recent Transactions</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Last 5 recharges</p>
            </div>
            <Link to="/history" className="text-sm font-semibold text-brand-500 hover:text-brand-600
              dark:text-brand-400 dark:hover:text-brand-300 transition-colors" id="view-history-link">
              View All →
            </Link>
          </div>

          {recentTx.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm mt-1">Your recharge history will appear here.</p>
              <Link to="/plans" className="btn-primary mt-4 inline-flex" id="no-tx-recharge-btn">
                Recharge Now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left pb-3 font-semibold px-2">Transaction ID</th>
                    <th className="text-left pb-3 font-semibold px-2">Plan</th>
                    <th className="text-left pb-3 font-semibold px-2 hidden sm:table-cell">Date</th>
                    <th className="text-right pb-3 font-semibold px-2">Amount</th>
                    <th className="text-right pb-3 font-semibold px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-2 font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                        {tx.transaction_id}
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">
                        {tx.plan_name}
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                        {new Date(tx.recharged_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-slate-800 dark:text-slate-200">
                        ₹{tx.amount}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`badge ${tx.status === 'Success' ? 'badge-success' : tx.status === 'Failed' ? 'badge-error' : 'badge-warning'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleRechargeSuccess}
        />
      )}
    </div>
  );
}
