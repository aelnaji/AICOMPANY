'use client';
import { useState, useEffect, useRef } from 'react';
import type { Agent, Message, Settings } from '../_types';
import { Send, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
  agent: Agent | undefined;
  agents: Agent[];
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSelectAgent: (id: string) => void;
  settings: Settings;
};

export function RightPanel({ agent, agents, messages, onSendMessage, onSelectAgent, settings }: Props) {
  const [inputText, setInputText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => { if (inputText.trim()) { onSendMessage(inputText); setInputText(''); } };
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const statusLabel = (s: Agent['status']) => ({ working: 'Working', alarm: 'Question Pending', 'ceo-calling': 'CEO Calling', idle: 'Idle' }[s]);
  const statusColor = (s: Agent['status']) => ({ working: '#22c55e', alarm: '#ef4444', 'ceo-calling': '#f5a623', idle: '#4b5563' }[s]);

  if (!agent) return null;

  return (
    <div className="w-96 h-full flex flex-col border-l" style={{ background: '#161a1f', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full flex items-center justify-between p-3 rounded" style={{ background: '#1e2329', color: '#e8eaed' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: '#0d0f12', color: '#00c9a7', border: '1px solid rgba(0,201,167,0.3)' }}>{agent.avatar}</div>
              <div className="text-left">
                <div className="text-sm font-medium">{agent.name}</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>{agent.role}</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: '#6b7280' }} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded shadow-lg z-10" style={{ background: '#1e2329', border: '1px solid rgba(255,255,255,0.08)' }}>
              {agents.map(a => (
                <button key={a.id} onClick={() => { onSelectAgent(a.id); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 text-left"
                  style={{ background: a.id === agent.id ? '#0d0f12' : 'transparent' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: '#0d0f12', color: '#00c9a7', border: '1px solid rgba(0,201,167,0.3)' }}>{a.avatar}</div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#e8eaed' }}>{a.name}</div>
                    <div className="text-xs" style={{ color: '#6b7280' }}>{a.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: statusColor(agent.status) }} />
          <span className="text-xs" style={{ color: '#6b7280' }}>Status: <span style={{ color: '#e8eaed' }}>{statusLabel(agent.status)}</span></span>
        </div>
        <div className="mt-2 text-xs" style={{ color: '#6b7280' }}>Current task: <span style={{ color: '#e8eaed' }}>{agent.task}</span></div>
        {agent._meta && <div className="mt-1 text-xs" style={{ color: '#374151' }}>Model: {agent._meta.modelName} · Provider: {agent._meta.providerName}</div>}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="text-center py-8" style={{ color: '#6b7280' }}>
              <div className="text-sm">No messages yet</div>
              <div className="text-xs mt-1">Send a directive or ask a question</div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'ceo' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'agent' && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mr-2" style={{ background: '#1e2329', color: '#00c9a7', border: '1px solid rgba(0,201,167,0.3)' }}>{agent.avatar}</div>
              )}
              <div className="max-w-[75%] px-3 py-2 rounded-lg" style={{ background: msg.sender === 'ceo' ? '#f5a623' : '#1e2329', color: msg.sender === 'ceo' ? '#0d0f12' : '#e8eaed' }}>
                <div className="text-sm">{msg.text}</div>
                <div className="text-xs mt-1" style={{ color: msg.sender === 'ceo' ? 'rgba(13,15,18,0.6)' : '#6b7280' }}>{format(msg.timestamp, 'HH:mm:ss')}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex gap-2 mb-2">
          <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={onKey} placeholder="Message agent…"
            className="flex-1 px-3 py-2 rounded text-sm outline-none"
            style={{ background: '#1e2329', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.08)' }} />
          <button onClick={send} disabled={!inputText.trim()} className="px-4 py-2 rounded" style={{ background: '#00c9a7', color: '#0d0f12', opacity: inputText.trim() ? 1 : 0.5 }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: '#6b7280' }}>
          {[['#22c55e','Working'],['#f5a623','CEO Calling'],['#ef4444','Question'],['#4b5563','Idle']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: c }} />{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
