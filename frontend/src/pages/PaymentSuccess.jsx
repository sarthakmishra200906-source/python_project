import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// ── Animated checkmark ────────────────────────────────────────
function AnimatedCheck() {
  return (
    <div className="relative h-24 w-24 mx-auto mb-6">
      {/* Outer pulsing ring */}
      <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
      {/* Middle ring */}
      <div className="absolute inset-2 rounded-full bg-emerald-400/30" />
      {/* Inner circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500
        flex items-center justify-center shadow-xl shadow-emerald-500/40">
        <svg className="h-10 w-10 text-white" style={{ animation: 'checkDraw 0.5s ease-out 0.2s both' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <style>{`
        @keyframes checkDraw {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Confetti burst (CSS only) ─────────────────────────────────
function Confetti() {
  const colors = ['#6366f1','#8b5cf6','#f43f5e','#f59e0b','#10b981','#06b6d4'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left:             `${Math.random() * 100}%`,
            top:              `-10px`,
            width:            `${6 + Math.random() * 6}px`,
            height:           `${10 + Math.random() * 8}px`,
            backgroundColor:  colors[i % colors.length],
            opacity:          0.8,
            animation:        `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(${Math.random() > 0.5 ? '' : '-'}720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccess() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [copied, setCopied] = useState(false);

  // Redirect if accessed directly without state
  useEffect(() => {
    if (!state?.transaction_id) navigate('/dashboard', { replace: true });
  }, [state, navigate]);

  if (!state?.transaction_id) return null;

  const { transaction_id, plan, user } = state;

  const handleCopy = () => {
    navigator.clipboard?.writeText(transaction_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center
      bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <Confetti />

      <div className="relative z-10 w-full max-w-md animate-pop">
        <div className="glass-card p-8 text-center">

          {/* Animated check */}
          <AnimatedCheck />

          {/* Heading */}
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
            Recharge Successful! 🎉
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Your plan has been activated instantly.
          </p>

          {/* Transaction ID */}
          <div className="flex items-center justify-between gap-3 rounded-xl
            bg-slate-100 dark:bg-slate-800 px-4 py-3 mb-6">
            <div className="text-left">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Transaction ID</p>
              <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                {transaction_id}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-500
                hover:text-brand-500 transition-all hover:scale-110 active:scale-95"
              id="copy-txn-btn"
              title="Copy transaction ID"
            >
              {copied
                ? <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
              }
            </button>
          </div>

          {/* Plan details */}
          {plan && (
            <div className="rounded-xl bg-gradient-to-br from-brand-50 to-violet-50
              dark:from-brand-900/20 dark:to-violet-900/20
              border border-brand-200/50 dark:border-brand-800/50 p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase tracking-wider mb-3">
                Plan Details
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Plan',      plan.name],
                  ['Amount',    `₹${plan.price}`],
                  ['Data',      plan.data],
                  ['Validity',  plan.validity_days > 0 ? `${plan.validity_days} days` : 'No expiry'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-400 dark:text-slate-500 text-xs block">{k}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className="btn-primary" id="success-dashboard-btn">
              Go to Dashboard
            </Link>
            <Link to="/plans" className="btn-secondary" id="success-plans-btn">
              Recharge Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
