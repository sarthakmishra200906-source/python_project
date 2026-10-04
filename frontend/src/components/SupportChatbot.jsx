import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const quickQuestions = ['How do I recharge?', 'How do I set my PIN?', 'Where is my history?'];

const routes = {
  plans: '/plans',
  dashboard: '/dashboard',
  history: '/history',
  login: '/login',
};

function actionFor(text) {
  const query = text.toLowerCase();
  if (query.includes('plan') || query.includes('recharge')) return { label: 'Open Plans', to: routes.plans };
  if (query.includes('pin') || query.includes('payment') || query.includes('qr')) return { label: 'Open Dashboard', to: routes.dashboard };
  if (query.includes('history') || query.includes('receipt')) return { label: 'Open History', to: routes.history };
  if (query.includes('otp') || query.includes('signup') || query.includes('login')) return { label: 'Open Login', to: routes.login };
  return null;
}

export default function SupportChatbot() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I run locally with Ollama and can help you navigate RechargeX.' },
  ]);

  const ask = async (question) => {
    const message = question.trim();
    if (!message || loading) return;
    setDraft('');
    setMessages((current) => [...current, { from: 'user', text: message }]);
    setLoading(true);
    try {
      const history = messages.slice(-6).map(({ from, text }) => ({ role: from === 'user' ? 'user' : 'assistant', content: text }));
      const response = await apiClient.post('/chat', { message, history });
      setMessages((current) => [...current, { from: 'bot', text: response.data.answer, source: response.data.source, action: actionFor(message) }]);
    } catch {
      setMessages((current) => [...current, { from: 'bot', text: 'The local assistant is unavailable. You can still use Plans, Dashboard, Login, and History from the navigation.' , action: actionFor(message) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && <section className="mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800" aria-label="RechargeX assistant">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-3 text-white">
          <div><p className="font-bold">RechargeX Assistant</p><p className="text-xs text-white/75">Local Ollama help</p></div>
          <button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-xl text-white/80 hover:bg-white/10" aria-label="Close assistant">×</button>
        </div>
        <div className="max-h-80 space-y-3 overflow-y-auto p-3" aria-live="polite">
          {messages.map((message, index) => <div key={`${message.from}-${index}`} className={message.from === 'user' ? 'ml-8' : 'mr-4'}>
            <div className={`rounded-xl px-3 py-2 text-sm ${message.from === 'user' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>{message.text}</div>
            {message.action && <button onClick={() => navigate(message.action.to)} className="mt-1 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400">{message.action.label} →</button>}
          </div>)}
          {loading && <div className="mr-4 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-700">Thinking locally…</div>}
        </div>
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">{quickQuestions.map((question) => <button key={question} onClick={() => ask(question)} className="rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-500 hover:border-brand-400 hover:text-brand-500 dark:border-slate-600 dark:text-slate-300">{question}</button>)}</div>
        <form onSubmit={(event) => { event.preventDefault(); ask(draft); }} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
          <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask for help…" className="input-field py-2 text-sm" aria-label="Ask RechargeX Assistant" />
          <button type="submit" className="btn-primary px-3 py-2" aria-label="Send question">↑</button>
        </form>
      </section>}
      <button onClick={() => { setOpen((value) => !value); setTimeout(() => inputRef.current?.focus(), 0); }} className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-2xl text-white shadow-xl shadow-brand-500/30 transition-transform hover:scale-105" aria-label={open ? 'Close support assistant' : 'Open support assistant'} title="Open support assistant">✦</button>
    </div>
  );
}
