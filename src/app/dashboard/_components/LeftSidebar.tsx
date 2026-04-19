'use client';
import type { Agent, Settings } from '../_types';
import { Plus, Settings as SettingsIcon, Play, Pause } from 'lucide-react';

type Props = {
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenAddAgent: () => void;
  onOpenSettings: () => void;
  settings: Settings;
  stats: { totalAgents: number; totalProviders: number; totalTasks: number } | null;
};

const navItems = ['Headquarters', 'Tasks', 'Inbox', 'Files', 'Settings', 'Marketplace'];

export function LeftSidebar({ agents, selectedAgentId, onSelectAgent, isPaused, onTogglePause, onOpenAddAgent, onOpenSettings, settings, stats }: Props) {
  const getStatusLight = (s: Agent['status']) => {
    if (isPaused) return 'light-grey';
    return s === 'alarm' ? 'light-red' : s === 'working' || s === 'ceo-calling' ? 'light-green' : 'light-grey';
  };

  return (
    <div className="w-64 h-full flex flex-col border-r" style={{ background: '#161a1f', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#00c9a7' }}>AI HQ</div>
        <div className="flex flex-col gap-1">
          {navItems.map((item, i) => (
            <button key={item} className="text-left px-3 py-1.5 rounded text-sm"
              style={{ color: i === 0 ? '#00c9a7' : '#6b7280', background: i === 0 ? 'rgba(0,201,167,0.1)' : 'transparent' }}>
              {item}{item === 'Tasks' && stats ? <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs" style={{ background: '#00c9a7', color: '#0d0f12' }}>{stats.totalTasks}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="px-4 py-3 border-b grid grid-cols-2 gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-center p-2 rounded" style={{ background: '#1e2329' }}>
            <div className="text-lg font-bold" style={{ color: '#00c9a7' }}>{stats.totalAgents}</div>
            <div className="text-xs" style={{ color: '#6b7280' }}>Agents</div>
          </div>
          <div className="text-center p-2 rounded" style={{ background: '#1e2329' }}>
            <div className="text-lg font-bold" style={{ color: '#f5a623' }}>{stats.totalProviders}</div>
            <div className="text-xs" style={{ color: '#6b7280' }}>Providers</div>
          </div>
        </div>
      )}

      <div className="p-4 border-b flex flex-col gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button onClick={onOpenAddAgent} className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium" style={{ background: '#00c9a7', color: '#0d0f12' }}>
          <Plus className="w-4 h-4" />Spawn Agent
        </button>
        <button onClick={onOpenSettings} className="flex items-center gap-2 px-3 py-2 rounded text-sm" style={{ background: '#1e2329', color: '#e8eaed' }}>
          <SettingsIcon className="w-4 h-4" />Settings
        </button>
        <button onClick={onTogglePause} className="flex items-center gap-2 px-3 py-2 rounded text-sm"
          style={{ background: isPaused ? '#00c9a7' : '#1e2329', color: isPaused ? '#0d0f12' : '#e8eaed' }}>
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-medium mb-3" style={{ color: '#6b7280' }}>AGENT ROSTER</div>
        <div className="flex flex-col gap-2">
          {agents.map(agent => (
            <button key={agent.id} onClick={() => onSelectAgent(agent.id)}
              className="flex items-start gap-3 p-3 rounded text-left"
              style={{ background: selectedAgentId === agent.id ? '#1e2329' : 'transparent', borderLeft: selectedAgentId === agent.id ? '2px solid #00c9a7' : '2px solid transparent' }}>
              <div className="flex-shrink-0 mt-1"><div className={getStatusLight(agent.status)} style={{ width: 10, height: 10, borderRadius: '50%' }} /></div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                style={{ background: '#1e2329', color: '#00c9a7', border: '1px solid rgba(0,201,167,0.3)' }}>{agent.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: '#e8eaed' }}>{agent.name}</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>{agent.role}</div>
                {settings.showTaskSnippets && <div className="text-xs mt-0.5 truncate" style={{ color: '#6b7280' }}>{agent.task}</div>}
                {agent._meta && <div className="text-xs mt-0.5" style={{ color: '#374151' }}>{agent._meta.modelName}</div>}
                {agent.status === 'ceo-calling' && <div className="inline-block text-xs px-2 py-0.5 rounded-full mt-1" style={{ border: '1px solid #00c9a7', color: '#00c9a7' }}>CEO calling</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .light-green{background:#22c55e;box-shadow:0 0 6px #22c55e;animation:pulse 2s infinite}
        .light-red{background:#ef4444;box-shadow:0 0 8px #ef4444;animation:pulse .8s infinite}
        .light-grey{background:#4b5563}
      `}</style>
    </div>
  );
}
