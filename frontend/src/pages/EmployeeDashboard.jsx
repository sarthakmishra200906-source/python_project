import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

function Metric({ label, value, detail }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-800 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{detail}</p>
    </div>
  );
}

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/employee/analytics')
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="max-w-md mx-auto mt-20 p-6 text-center glass-card text-red-500">{error}</div>;
  if (!data) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" text="Loading employee analytics…" /></div>;

  const { summary, network_mix: networkMix, top_plans: topPlans, trend, churn } = data;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">Operations console</p>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Employee Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Customer activity, revenue, and plan performance from MySQL.</p>
          </div>
          <Link to="/dashboard" className="btn-secondary self-start">Customer view</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Metric label="Customers" value={summary.total_customers} detail="Registered customer accounts" />
          <Metric label="Successful recharges" value={summary.total_recharges} detail="All-time completed payments" />
          <Metric label="Revenue" value={`₹${Number(summary.total_revenue).toFixed(0)}`} detail="From successful recharges" />
        </div>

        <section className="glass-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div><h2 className="font-bold text-slate-800 dark:text-slate-100">Churn-risk outreach queue</h2><p className="text-xs text-slate-400 mt-1">Aigic supervised model scores customers so the team contacts only accounts needing attention.</p></div>
            <span className={`badge ${churn?.available ? 'badge-success' : 'badge-warning'}`}>{churn?.available ? 'Model connected' : 'Model unavailable'}</span>
          </div>
          {churn?.available ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {['HIGH', 'MEDIUM', 'LOW'].map((tier) => <div key={tier} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3"><p className="text-xs text-slate-500">{tier} risk</p><p className="text-xl font-black text-slate-800 dark:text-slate-100">{churn.counts[tier]}</p></div>)}
              </div>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="pb-3">Customer</th><th className="pb-3">Network</th><th className="pb-3">Risk</th><th className="pb-3">Recommended action</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{churn.customers.slice(0, 10).map((customer) => <tr key={customer.id}><td className="py-3 pr-3"><span className="font-semibold text-slate-700 dark:text-slate-200">{customer.name}</span><span className="block text-xs text-slate-400">{customer.phone}</span></td><td className="py-3 pr-3 text-slate-500">{customer.network_type}</td><td className="py-3 pr-3"><span className={`badge ${customer.risk_tier === 'HIGH' ? 'badge-error' : customer.risk_tier === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>{customer.churn_probability_pct}</span></td><td className="py-3 text-xs text-slate-500 dark:text-slate-400">{customer.retention_plan.primary_retention_offer}</td></tr>)}</tbody></table></div>
            </>
          ) : <p className="text-sm text-amber-600 dark:text-amber-400">{churn?.error || 'Configure AIGIC_PATH and install the aigic dependencies.'}</p>}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="glass-card p-6">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Network performance</h2>
            <div className="space-y-3">
              {networkMix.map((item) => (
                <div key={item.network}>
                  <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-slate-700 dark:text-slate-200">{item.network}</span><span className="text-slate-500">{item.recharges} recharges · ₹{Number(item.revenue).toFixed(0)}</span></div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${Math.min(100, Number(item.recharges) * 10)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Recharge trend</h2>
            {trend.length === 0 ? <p className="text-sm text-slate-500">No recharge data yet.</p> : (
              <div className="space-y-3">
                {trend.map((item) => <div key={item.month} className="flex items-center justify-between text-sm"><span className="text-slate-500">{item.month}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{item.recharges} recharges · ₹{Number(item.revenue).toFixed(0)}</span></div>)}
              </div>
            )}
          </section>
        </div>

        <section className="glass-card overflow-hidden">
          <div className="p-6 pb-4"><h2 className="font-bold text-slate-800 dark:text-slate-100">Top plans</h2><p className="text-xs text-slate-400 mt-1">A compact view for the employee team.</p></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 dark:bg-slate-900"><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="px-6 py-3">Plan</th><th className="px-6 py-3">Network</th><th className="px-6 py-3">Recharges</th><th className="px-6 py-3">Revenue</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{topPlans.map((plan) => <tr key={plan.plan_name}><td className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200">{plan.plan_name}</td><td className="px-6 py-3 text-slate-500">{plan.network}</td><td className="px-6 py-3 text-slate-500">{plan.recharges}</td><td className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200">₹{Number(plan.revenue).toFixed(0)}</td></tr>)}</tbody></table></div>
        </section>
      </div>
    </div>
  );
}
