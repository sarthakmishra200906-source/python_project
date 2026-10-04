import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import LoadingSpinner from './LoadingSpinner';

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function PaymentModal({ plan, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep]       = useState('review');   // review | pin | qr | processing | done
  const [error, setError]     = useState('');
  const [progress, setProgress] = useState(0);
  const [paymentPin, setPaymentPin] = useState('');
  const [qrReady, setQrReady] = useState(false);
  const completionTimer = useRef(null);

  useEffect(() => () => clearTimeout(completionTimer.current), []);

  // Fake processing animation
  useEffect(() => {
    if (step !== 'processing') return;
    setProgress(0);
    const steps = [10, 30, 55, 75, 90, 100];
    let i = 0;
    const iv = setInterval(() => {
      setProgress(steps[i++]);
      if (i >= steps.length) clearInterval(iv);
    }, 300);
    return () => clearInterval(iv);
  }, [step]);

  useEffect(() => {
    if (step !== 'qr') return undefined;
    setQrReady(false);
    const timer = setTimeout(() => setQrReady(true), 2500);
    return () => clearTimeout(timer);
  }, [step]);

  const handleConfirm = async () => {
    setStep('processing');
    setError('');
    try {
      const res = await apiClient.post('/recharge', {
        user_id: user.id,
        plan_id: plan.id,
        payment_pin: paymentPin,
      });
      // Small delay to let progress bar finish
      completionTimer.current = setTimeout(() => {
        setStep('done');
        onSuccess(res.data);
      }, 2000);
    } catch (err) {
      setStep('review');
      setError(err.message);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget && step === 'review') onClose(); }}
        id="payment-modal-backdrop"
      >
        <div
          className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
            animate-pop overflow-hidden"
          id="payment-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {step === 'review' ? 'Confirm Recharge' : step === 'pin' ? 'Enter Payment PIN' : step === 'qr' ? 'Scan to Pay' : step === 'processing' ? 'Processing…' : 'Recharge Complete!'}
            </h2>
            {(step === 'review' || step === 'pin' || step === 'qr') && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700
                text-slate-500 dark:text-slate-400 transition-colors" id="modal-close-btn">
                <CloseIcon />
              </button>
            )}
          </div>

          <div className="p-5">
            {/* ── Review step ─────────────────────────────── */}
            {step === 'review' && (
              <>
                {/* Plan summary */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Selected Plan</p>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{plan.name}</p>
                    </div>
                    <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                      ₹{plan.price}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ['Data',     plan.data    ],
                      ['Calls',    plan.calls   ],
                      ['SMS',      plan.sms     ],
                      ['Validity', plan.validity_days > 0 ? `${plan.validity_days} days` : 'No expiry'],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white dark:bg-slate-800 rounded-lg p-2">
                        <span className="text-slate-400 dark:text-slate-500 block">{k}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User info */}
                <div className="flex items-center gap-3 rounded-xl bg-brand-50 dark:bg-brand-900/20
                  border border-brand-200 dark:border-brand-800 p-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-violet-500
                    flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">+91 {user?.phone}</p>
                  </div>
                </div>

                {/* Secure payment note */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-5">
                  <ShieldIcon />
                  <span>Secure mock payment — no real money charged</span>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600
                      text-slate-600 dark:text-slate-300 font-semibold text-sm
                      hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    id="modal-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep('pin')}
                    className="flex-1 btn-primary py-3"
                    id="modal-confirm-btn"
                  >
                    Pay ₹{plan.price}
                  </button>
                </div>
              </>
            )}

            {step === 'pin' && (
              <div className="py-4">
                <div className="text-center mb-5">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-2xl">🔐</div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Enter the six-digit payment PIN you saved in your dashboard.</p>
                </div>
                <input
                  id="payment-pin-input"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={paymentPin}
                  onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="input-field text-center tracking-[0.5em] text-xl mb-4"
                  autoFocus
                />
                {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                <button
                  onClick={() => paymentPin.length === 6 ? (setError(''), setStep('qr')) : setError('Enter all six digits.')}
                  className="w-full btn-primary py-3"
                  id="payment-pin-continue-btn"
                >
                  Continue to QR Payment
                </button>
              </div>
            )}

            {step === 'qr' && (
              <div className="py-2 text-center">
                <div className="inline-flex p-4 bg-white rounded-2xl shadow-inner border border-slate-200 mb-4">
                  <QRCodeSVG value={`rechargex://pay?amount=${plan.price}&plan=${plan.id}&user=${user.id}`} size={180} level="M" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">Scan with any QR app</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">Demo payment only. No money will be charged. Waiting for a scan confirmation…</p>
                {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                <button onClick={handleConfirm} disabled={!qrReady} className="w-full btn-primary py-3 disabled:cursor-not-allowed disabled:opacity-50" id="payment-scan-confirm-btn">
                  {qrReady ? 'I Scanned It — Complete Demo Payment' : 'Waiting for QR scan…'}
                </button>
              </div>
            )}

            {/* ── Processing step ──────────────────────────── */}
            {step === 'processing' && (
              <div className="py-8 flex flex-col items-center gap-5">
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-900" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500"
                    style={{ animation: 'spin 0.8s linear infinite' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-500">{progress}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Processing your recharge…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
