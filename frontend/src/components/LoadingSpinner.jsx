export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} animate-spin rounded-full
          border-4 border-slate-200 dark:border-slate-700
          border-t-brand-500`}
      />
      {text && (
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
