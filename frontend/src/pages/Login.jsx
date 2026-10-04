import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

// ── Decorative SVG background ──────────────────────────────────
function AuthBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[600px] h-[600px] bg-gradient-to-br from-brand-100/30 to-violet-100/30
        dark:from-brand-900/10 dark:to-violet-900/10 rounded-full blur-2xl" />
    </div>
  );
}

// ── Form field ─────────────────────────────────────────────────
function Field({ id, label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-field"
      />
    </div>
  );
}

export default function Login() {
  const [tab, setTab] = useState('login');    // 'login' | 'signup'
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // Login fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass,  setLoginPass]  = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Signup fields
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [email,    setEmail]    = useState('');
  const [pass,     setPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [signupOtp, setSignupOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const resetMessages = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { phone: loginPhone, password: loginPass });
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    resetMessages();
    if (pass !== confirmPass) { setError('Passwords do not match.'); return; }
    if (pass.length < 6)      { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      if (!otpSent) {
        const otpResponse = await apiClient.post('/auth/send-otp', { phone });
        setOtpSent(true);
        setDemoOtp(otpResponse.data.demo_otp || '');
        setSuccess('Demo OTP generated. Enter the code shown below.');
      } else {
        await apiClient.post('/auth/verify-otp', { phone, otp: signupOtp });
        await apiClient.post('/auth/signup', { name, phone, email, password: pass });
        setSuccess('Account created! You can now log in.');
        setTab('login');
        setLoginPhone(phone);
        setName(''); setPhone(''); setEmail(''); setPass(''); setConfirmPass('');
        setConfirmPass(''); setSignupOtp(''); setOtpSent(false); setDemoOtp('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    resetMessages();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/google-demo');
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    resetMessages();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/admin-demo');
      login(res.data.user);
      navigate('/employee');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }) => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {visible
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        : <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </>
      }
    </svg>
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center
      bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <AuthBg />

      <div className="relative z-10 w-full max-w-md animate-slide-in">
        {/* Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <span className="text-xl font-black">
                <span className="gradient-text">Recharge</span>
                <span className="text-slate-800 dark:text-white">X</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account for free.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mb-6 gap-1">
            {[['login', 'Log In'], ['signup', 'Sign Up']].map(([t, label]) => (
              <button
                key={t}
                id={`auth-tab-${t}`}
                onClick={() => { setTab(t); resetMessages(); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                  ${tab === t
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20
              border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm flex items-start gap-2">
              <span>✅</span> {success}
            </div>
          )}

          {/* ── Login form ─────────────────────────────────── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" id="login-form">
              <Field id="login-phone" label="Phone Number" type="tel"
                value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="Enter 10-digit number" required />

              <div>
                <label htmlFor="login-pass" className="block text-sm font-semibold
                  text-slate-700 dark:text-slate-300 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input id="login-pass" type={showLoginPass ? 'text' : 'password'}
                    value={loginPass} onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Enter your password" required className="input-field pr-10" />
                  <button type="button" onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <EyeIcon visible={showLoginPass} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                id="login-submit-btn">
                {loading ? <LoadingSpinner size="sm" /> : 'Log In →'}
              </button>

              <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                or
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              <button type="button" onClick={handleDemoGoogleLogin} disabled={loading}
                className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-600
                  text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100
                  dark:hover:bg-slate-700 transition-colors disabled:opacity-60" id="google-demo-login-btn">
                <span className="mr-2 font-black text-blue-500">G</span>
                Continue with Google (Demo)
              </button>

              <button type="button" onClick={handleAdminDemoLogin} disabled={loading}
                className="w-full py-3 rounded-xl border border-amber-300 dark:border-amber-700
                  text-amber-700 dark:text-amber-300 font-semibold text-sm hover:bg-amber-50
                  dark:hover:bg-amber-900/20 transition-colors disabled:opacity-60" id="admin-demo-login-btn">
                Open Employee Admin Dashboard (Demo)
              </button>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Demo: phone <strong>9999999999</strong> · password <strong>demo1234</strong>
              </p>
            </form>
          )}

          {/* ── Signup form ────────────────────────────────── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4" id="signup-form">
              <Field id="signup-name"  label="Full Name"    value={name}  onChange={(e) => setName(e.target.value)}  placeholder="e.g. Sarthak Mishra" required />
              <Field id="signup-phone" label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" required />
              <Field id="signup-email" label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

              <div>
                <label htmlFor="signup-pass" className="block text-sm font-semibold
                  text-slate-700 dark:text-slate-300 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input id="signup-pass" type={showPass ? 'text' : 'password'}
                    value={pass} onChange={(e) => setPass(e.target.value)}
                    placeholder="Min 6 characters" required className="input-field pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <EyeIcon visible={showPass} />
                  </button>
                </div>
              </div>

              <Field id="signup-confirm" label="Confirm Password" type="password"
                value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter password" required />

              {otpSent && (
                <>
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-center dark:border-brand-800 dark:bg-brand-900/20">
                    <p className="text-xs text-brand-600 dark:text-brand-400">Demo OTP for {phone}</p>
                    <p className="font-mono text-2xl font-black tracking-[0.35em] text-brand-700 dark:text-brand-300">{demoOtp}</p>
                  </div>
                  <Field id="signup-otp" label="Verification OTP" type="text"
                    value={signupOtp} onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter the 6-digit code" required />
                </>
              )}

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                id="signup-submit-btn">
                {loading ? <LoadingSpinner size="sm" /> : otpSent ? 'Verify & Create Account →' : 'Send OTP →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
