import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/admin/login', { login_id: loginId, password });
      login(response.data.user);
      navigate('/employee');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <form onSubmit={submit} className="glass-card w-full max-w-md p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Operations access</p>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Admin Login</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">Temporary classroom access to the employee analytics dashboard.</p>
        {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="admin-login-id">Admin ID</label>
        <input id="admin-login-id" value={loginId} onChange={(e) => setLoginId(e.target.value)} className="input-field mb-4" placeholder="Admin ID" required />
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field mb-6" placeholder="Password" required />
        <button className="w-full btn-primary" disabled={loading}>{loading ? <LoadingSpinner size="sm" /> : 'Open Employee Dashboard'}</button>
        <Link to="/login" className="block mt-4 text-center text-sm text-brand-500 hover:underline">Back to customer login</Link>
      </form>
    </div>
  );
}