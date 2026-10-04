import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import PlanCard from '../components/PlanCard';
import PaymentModal from '../components/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Popular', 'Data', 'Unlimited', 'Topup', 'Network'];

const catMeta = {
  Popular:   { icon: '🔥', desc: 'Best selling plans with great data and calls.' },
  Data:      { icon: '📡', desc: 'Pure data add-ons — top up your existing plan.' },
  Unlimited: { icon: '♾️', desc: 'Zero daily caps — true unlimited experience.' },
  Topup:     { icon: '💰', desc: 'Talktime recharges for your balance.' },
  Network:   { icon: '🌐', desc: 'Mobile networks, AirFiber, and wired Fiber plans.' },
};

export default function RechargePlans() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab,    setActiveTab]    = useState('Popular');
  const [plans,        setPlans]        = useState({});       // { category: [...] }
  const [loadingCat,   setLoadingCat]   = useState('');
  const [error,        setError]        = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [search,       setSearch]       = useState('');

  const fetchCategory = async (cat) => {
    if (plans[cat]) return;  // already cached
    setLoadingCat(cat);
    setError('');
    try {
      const res = await apiClient.get(`/plans/category/${cat}`);
      setPlans((prev) => ({ ...prev, [cat]: res.data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCat('');
    }
  };

  useEffect(() => { fetchCategory(activeTab); }, [activeTab]); // eslint-disable-line

  const handleTabChange = (cat) => { setActiveTab(cat); setSearch(''); };

  const handleRecharge = (plan) => {
    if (!user) { navigate('/login'); return; }
    setSelectedPlan(plan);
  };

  const handleSuccess = (data) => {
    updateUser(data.user);
    navigate('/payment-success', { state: data });
  };

  const visiblePlans = (plans[activeTab] || []).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.data.toLowerCase().includes(q)  ||
      String(p.price).includes(q)
    );
  });

  const meta = catMeta[activeTab];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 mb-3">
            Browse <span className="gradient-text">Recharge Plans</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Choose from mobile, AirFiber, and Fiber plans with instant activation.
          </p>
        </div>

        {/* ── Category tabs ────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`tab-${cat.toLowerCase()}`}
              onClick={() => handleTabChange(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                whitespace-nowrap transition-all duration-200 flex-shrink-0
                ${activeTab === cat
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'
                }`}
            >
              <span>{catMeta[cat].icon}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Category description + Search ───────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{meta.icon} {activeTab}</span>
            {' '} — {meta.desc}
          </p>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="plan-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans…"
              className="input-field pl-9 py-2 w-full sm:w-56 text-sm"
            />
          </div>
        </div>

        {/* ── Plans grid ──────────────────────────────────── */}
        {loadingCat === activeTab ? (
          <LoadingSpinner size="lg" text="Loading plans…" />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 dark:text-red-400 mb-4">⚠️ {error}</p>
            <button onClick={() => fetchCategory(activeTab)} className="btn-primary">
              Retry
            </button>
          </div>
        ) : visiblePlans.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">No plans match your search.</p>
            <button onClick={() => setSearch('')} className="btn-secondary mt-4">Clear Search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visiblePlans.map((plan, i) => (
              <div key={plan.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-in">
                <PlanCard plan={plan} onRecharge={handleRecharge} />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
