export default function PlanCard({ plan, onRecharge }) {
  const categoryColors = {
    Popular:   'from-violet-500 to-indigo-600',
    Data:      'from-blue-500 to-cyan-600',
    Unlimited: 'from-emerald-500 to-teal-600',
    Topup:     'from-amber-500 to-orange-600',
    Network:   'from-sky-500 to-blue-700',
  };

  const categoryBg = {
    Popular:   'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    Data:      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    Unlimited: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    Topup:     'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    Network:   'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
  };

  const gradient = categoryColors[plan.category] || 'from-brand-500 to-violet-600';
  const catBg    = categoryBg[plan.category]     || categoryBg.Popular;

  return (
    <div
      className="group relative bg-white dark:bg-slate-800 rounded-2xl
        border border-slate-200 dark:border-slate-700
        shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/50
        transition-all duration-300 hover:-translate-y-1 overflow-hidden
        flex flex-col"
      id={`plan-card-${plan.id}`}
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} rounded-t-2xl`} />

      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${catBg}`}>
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Category tag */}
        <span className={`inline-flex w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${catBg}`}>
          {plan.category}
        </span>

        {/* Plan name */}
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
          {plan.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            ₹{Math.floor(plan.price)}
          </span>
          {plan.price % 1 !== 0 && (
            <span className="text-base font-semibold text-slate-500 dark:text-slate-400">
              .{String(Math.round((plan.price % 1) * 100)).padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Plan features */}
        <div className="space-y-2.5 flex-1 mb-5">
          {[
            { icon: '📶', label: 'Data',     value: plan.data     },
            { icon: '🌐', label: 'Network',  value: plan.network_type || '4G' },
            { icon: '📞', label: 'Calls',    value: plan.calls    },
            { icon: '💬', label: 'SMS',      value: plan.sms      },
            { icon: '📅', label: 'Validity', value: plan.validity_days > 0 ? `${plan.validity_days} days` : 'No expiry' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span>{icon}</span>
                <span>{label}</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[55%] truncate">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        {plan.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 line-clamp-2">
            {plan.description}
          </p>
        )}

        {/* CTA Button */}
        <button
          onClick={() => onRecharge(plan)}
          className={`w-full py-3 rounded-xl font-bold text-sm text-white
            bg-gradient-to-r ${gradient}
            hover:opacity-90 hover:shadow-lg hover:scale-[1.02]
            active:scale-95 transition-all duration-200
            shadow-md`}
          id={`recharge-btn-${plan.id}`}
        >
          Recharge Now
        </button>
      </div>
    </div>
  );
}
