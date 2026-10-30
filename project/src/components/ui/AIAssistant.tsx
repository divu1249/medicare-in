import { useState } from 'react';
import { Send, Bot, User, Loader2, AlertTriangle } from 'lucide-react';

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Please try again or dial 112 for immediate emergencies.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[500px] rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-emerald-50/50 p-4 dark:border-slate-800 dark:bg-emerald-950/20 rounded-t-2xl">
        <Bot className="h-6 w-6 text-emerald-600" />
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">MediGuard Clinical AI</h3>
          <p className="text-xs text-slate-500">Powered by Llama 3 • Beta</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-sm font-medium">Do not use AI for life-threatening emergencies.</p>
            <p className="text-xs text-center px-4">Ask about first-aid steps, medication schedules, or symptom triage.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="border-t border-slate-100 p-3 dark:border-slate-800 flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a medical question..." 
          className="input flex-1"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary px-3">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}