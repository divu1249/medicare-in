import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, Sparkles, BookOpen, AlertTriangle, Info, RotateCcw, User } from 'lucide-react';
import { Card, PageHeader, Badge, SectionTitle, EmptyState } from '@/components/ui';
import { useData } from '@/context/DataContext';
import { healthAdvisorResponses, suggestedHealthQuestions, libraryArticles } from '@/data/demoData';
import type { ChatMessage } from '@/types';
import { uid } from '@/lib/medUtils';

export default function AIHealthAdvisor() {
  const { chat, addChatMessage, clearChat } = useData();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, loading]);

  function findResponse(question: string): { response: string; links: string[] } | null {
    const q = question.toLowerCase();
    for (const entry of healthAdvisorResponses) {
      if (entry.keywords.some((k) => q.includes(k))) return entry;
    }
    return null;
  }

  function handleSend(question?: string) {
    const text = (question || input).trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { id: uid('msg-'), role: 'user', content: text, timestamp: new Date().toISOString() };
    addChatMessage(userMsg);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const match = findResponse(text);
      let response: string;
      let links: string[] = [];
      if (match) {
        response = match.response;
        links = match.links;
      } else {
        response = 'I can provide general educational health information on topics like diabetes, blood pressure, medication adherence, first aid, and allergies. For specific medical advice, diagnosis, or treatment, please consult a qualified healthcare professional. This is a demonstration and not connected to a live AI or medical system.';
      }
      const linkText = links.length > 0
        ? '\n\nRelated articles: ' + links.map((id) => libraryArticles.find((a) => a.id === id)?.title).filter(Boolean).join(', ')
        : '';
      const assistantMsg: ChatMessage = { id: uid('msg-'), role: 'assistant', content: response + linkText, timestamp: new Date().toISOString() };
      addChatMessage(assistantMsg);
      setLoading(false);
    }, 800);
  }

  return (
    <div>
      <PageHeader
        title="AI Health Advisor"
        subtitle="Ask general health questions and get educational responses."
        actions={
          chat.length > 0 ? (
            <button onClick={clearChat} className="btn btn-outline">
              <RotateCcw className="h-4 w-4" /> Clear Chat
            </button>
          ) : undefined
        }
      />

      {/* Demo notice */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-warning-50 p-4 dark:bg-warning-700/10">
        <AlertTriangle className="h-6 w-6 text-warning-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-warning-700 dark:text-warning-400">Demo — Not Connected to a Live AI or Medical System</p>
          <p className="text-xs text-warning-600 dark:text-warning-500">Responses are predefined educational text. This does not provide diagnosis, treatment recommendations, or access to health records.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col" >
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary-500" />
            <SectionTitle>Health Advisor Chat</SectionTitle>
          </div>

          <div ref={scrollRef} className="mb-4 max-h-[400px] min-h-[300px] flex-1 space-y-3 overflow-y-auto rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
            {chat.length === 0 && !loading && (
              <div className="flex h-full items-center justify-center">
                <EmptyState icon={<Sparkles className="h-8 w-8" />} title="Ask a health question" message="Try a suggested question or type your own." />
              </div>
            )}
            {chat.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${msg.role === 'user' ? 'bg-primary-100 text-primary-600 dark:bg-primary-700/20' : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-700/20'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white text-gray-800 dark:bg-slate-700 dark:text-gray-200'}`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 dark:bg-secondary-700/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-700">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Ask a general health question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              aria-label="Type your health question"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="btn btn-primary">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </Card>

        {/* Suggestions */}
        <div className="space-y-4">
          <Card>
            <SectionTitle className="mb-3">Suggested Questions</SectionTitle>
            <div className="space-y-2">
              {suggestedHealthQuestions.map((q) => (
                <button key={q} onClick={() => handleSend(q)} className="w-full rounded-xl border border-gray-100 p-3 text-left text-sm text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-slate-800 dark:text-gray-300 dark:hover:bg-primary-700/10">
                  {q}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-5 w-5 text-secondary-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">How this works</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The advisor matches your question to predefined educational responses. It does not learn, diagnose, or recommend medication changes.</p>
              </div>
            </div>
          </Card>
          <Link to="/library" className="card flex items-center gap-3 p-4 transition hover:border-primary-300">
            <BookOpen className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Browse Medical Library</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Read offline health articles</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
