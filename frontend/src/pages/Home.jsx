import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import apiClient from '../api/apiClient';
import PlanCard from '../components/PlanCard';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── Feature cards ──────────────────────────────────────────────
const features = [
  {
    icon: '⚡',
    title: 'Instant Activation',
    desc:  'Recharges are processed in under 10 seconds. No delays, no waiting.',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    desc:  '256-bit encryption on all transactions. Your data is always protected.',
    gradient: 'from-green-400 to-emerald-600',
  },
  {
    icon: '📊',
    title: 'Usage Analytics',
    desc:  'Visual charts to track your data, spending, and recharge history.',
    gradient: 'from-brand-400 to-violet-600',
  },
  {
    icon: '🌐',
    title: '5G Ready Plans',
    desc:  'Next-gen plans designed for 5G speeds, available everywhere.',
    gradient: 'from-cyan-400 to-blue-600',
  },
];

// ── Animated count-up hook ─────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ label, value, suffix = '', prefix = '' }) {
  const count = useCountUp(value);
  return (
    <div className="text-center">
      <div className="text-4xl font-black gradient-text">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [popularPlans, setPopularPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    apiClient.get('/plans/category/Popular')
      .then((r) => setPopularPlans(r.data.slice(0, 4)))
      .catch(() => {});
  }, []);

  const handleRecharge = (plan) => {
    if (!user) { navigate('/login'); return; }
    setSelectedPlan(plan);
  };

  const handleSuccess = (data) => {
    updateUser(data.user);
    navigate('/payment-success', { state: data });
  };

  return (
    <div className="animate-fade-in">
      {/* ── Hero carousel ──────────────────────────────────── */}
      <HeroCarousel />

      {/* ── Stats strip ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-500 to-violet-600 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard label="Happy Users"       value={2400000} suffix="+" />
            <StatCard label="Plans Available"   value={14}                  />
            <StatCard label="Networks Supported" value={4}                  />
            <StatCard label="Uptime SLA"         value={99}      suffix="%" />
          </div>
        </div>
      </div>

      {/* ── Popular Plans ───────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900" id="popular-plans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge badge-brand mb-3">🔥 Most Chosen</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 mb-4">
              Popular Recharge Plans
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Hand-picked plans loved by millions. Great data, unlimited calls, and unbeatable value.
            </p>
          </div>

          {popularPlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onRecharge={handleRecharge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p>Start the backend server to see plans.</p>
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded mt-2 block w-fit mx-auto">
                cd backend &amp;&amp; python app.py
              </code>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/plans" className="btn-primary" id="view-all-plans-btn">
              View All Plans →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-slate-800" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 mb-4">
              Why Choose <span className="gradient-text">RechargeX</span>?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Built for speed, security, and simplicity — everything you need in a recharge platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-900
                  border border-slate-200 dark:border-slate-700
                  hover:border-brand-300 dark:hover:border-brand-700
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.gradient}
                  text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Recharge? <span className="text-brand-400">Get Started Free.</span>
          </h2>
          <p className="text-slate-400 mb-8">
            Create your account in seconds. No credit card required.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/login"  className="btn-primary px-8 py-4" id="home-cta-signup">Create Account</Link>
            <Link to="/plans"  className="btn-secondary px-8 py-4" id="home-cta-plans">Browse Plans</Link>
          </div>
        </div>
      </section>

      {/* Payment modal */}
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
