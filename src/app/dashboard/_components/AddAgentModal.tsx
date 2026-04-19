'use client';
import { useState } from 'react';
import type { Agent } from '../_types';
import { X } from 'lucide-react';

type Props = {
  onClose: () => void;
  onAdd: (agent: Omit<Agent, 'id'>) => void;
  providers: { id: string; name: string; type: string }[];
  models: { id: string; name: string; displayName: string; providerId: string }[];
};

const specializations = ['LEAD','BACKEND','FRONTEND','QA','DEVOPS','DATA','RESEARCH','CUSTOM'];

export function AddAgentModal({ onClose, onAdd, providers, models }: Props) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [spec, setSpec] = useState('BACKEND');
  const [task, setTask] = useState('');
  const [providerId, setProviderId] = useState(providers[0]?.id ?? '');
  const [modelId, setModelId] = useState(models[0]?.id ?? '');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableModels = models.filter(m => !providerId || m.providerId === providerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    setSaving(true);
    try {
      // Create real agent in AICOMPANY DB
      const res = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), role: spec, description: role.trim(), providerId, modelId, isActive }),
      });
      const json = await res.json();
      const created = json.data;
      onAdd({
        name: created.name,
        role: created.role,
        task: task.trim() || 'Standby',
        status: isActive ? 'working' : 'idle',
        avatar: created.name.split(/[-\s]+/).map((w: string) => w[0]?.toUpperCase() ?? '').slice(0,2).join(''),
        _meta: { modelName: models.find(m => m.id === modelId)?.displayName ?? 'Unknown', providerName: providers.find(p => p.id === providerId)?.name ?? 'Unknown', taskCount: 0 },
      });
    } catch {
      // Fallback: local only
      onAdd({ name: name.trim(), role: spec, task: task.trim() || 'Standby', status: isActive ? 'working' : 'idle',
        avatar: name.split(/[-\s]+/).map(w => w[0]?.toUpperCase() ?? '').slice(0,2).join('') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-lg shadow-xl" style={{ background: '#161a1f', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#e8eaed' }}>Spawn New Agent</h2>
          <button onClick={onClose} className="p-1 rounded" style={{ background: '#1e2329' }}><X className="w-5 h-5" style={{ color: '#6b7280' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {[['Agent Name','text',name,setName,'AGENT-NAME'],['Role / Title','text',role,setRole,'e.g. Backend Engineer']].map(([label,,val,setter,ph]) => (
            <div key={label as string}>
              <label className="block text-sm font-medium mb-2" style={{ color: '#e8eaed' }}>{label as string}</label>
              <input type="text" value={val as string} onChange={e => (setter as (v:string)=>void)(e.target.value)}
                placeholder={ph as string} required className="w-full px-3 py-2 rounded text-sm outline-none"
                style={{ background: '#1e2329', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#e8eaed' }}>Specialization</label>
            <select value={spec} onChange={e => setSpec(e.target.value)} className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{ background: '#1e2329', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.08)' }}>
              {specializations.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {providers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#e8eaed' }}>Provider</label>
              <select value={providerId} onChange={e => { setProviderId(e.target.value); setModelId(''); }} className="w-full px-3 py-2 rounded text-sm outline-none"
                style={{ background: '#1e2329', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.08)' }}>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {availableModels.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#e8eaed' }}>Model</label>
              <select value={modelId} onChange={e => setModelId(e.target.value)} className="w-full px-3 py-2 rounded text-sm outline-none"
                style={{ background: '#1e2329', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.08)' }}>
                {availableModels.map(m => <option key={m.id} value={m.id}>{m.displayName || m.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#e8eaed' }}>Initial Task</label>
            <textarea value={task} onChange={e => setTask(e.target.value)} rows={2} placeholder="Describe the first task..."
              className="w-full px-3 py-2 rounded text-sm outline-none resize-none"
              style={{ background: '#1e2329', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ accentColor: '#00c9a7' }} />
            <span className="text-sm" style={{ color: '#e8eaed' }}>Start as Active</span>
          </label>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded text-sm font-medium" style={{ background: '#1e2329', color: '#e8eaed' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded text-sm font-medium" style={{ background: '#00c9a7', color: '#0d0f12', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Spawning...' : 'Spawn Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
