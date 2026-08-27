import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import type { Machine } from '@/services/types';
import { aiAssistant } from '@/services/aiAssistant';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

export function AIAssistant({ machine }: { machine: Machine }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset conversation when the machine changes.
  useEffect(() => {
    setMessages([
      {
        id: 0,
        role: 'assistant',
        text: `Hi — I'm the maintenance assistant for ${machine.name}. Ask me why this machine is in its current state, or what to do about a specific sensor.`,
      },
    ]);
  }, [machine.id, machine.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text: q };
    const reply = aiAssistant.generateReply(q, { machine });
    const botMsg: Message = { id: Date.now() + 1, role: 'assistant', text: reply };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 px-4 py-4 min-h-0">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                m.role === 'assistant'
                  ? 'bg-cyan-500/15 text-cyan-300'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'assistant'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700/60'
                  : 'bg-cyan-500/10 text-cyan-100 border border-cyan-500/20'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-3 pt-2 border-t border-slate-700/50">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {aiAssistant.quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors border border-slate-600/40"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this machine..."
            className="flex-1 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
