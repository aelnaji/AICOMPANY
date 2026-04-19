'use client';
import type { Settings } from '../_types';
import { X, AlertTriangle } from 'lucide-react';

type Props = {
  settings: Settings;
  onUpdateSettings: (s: Settings) => void;
  onClose: () => void;
  onResetAgents: () => void;
};

export function SettingsPanel({ settings, onUpdateSettings, onClose, onResetAgents }: Props) {
  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => onUpdateSettings({ ...settings, [k]: v });

  const toggle = (k: keyof Settings, label: string) => (
    <label key={k} className="flex items-center justify-between cursor-pointer">
      <span className="text-sm" style={{ color: '#e8eaed' }}>{label}</span>
      <input type="checkbox" checked={settings[k] as boolean} onChange={e => update(k, e.target.checked as Settings[K])} style={{ accentColor: '#00c9a7' }} />
    </label>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-end z-50" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-md h-full overflow-y-auto shadow-xl" style={{ background: '#161a1f', borderLeft: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#161a1f' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#e8eaed' }}>Settings</h2>
          <button onClick={onClose} className="p-1 rounded" style={{ background: '#1e2329' }}><X className="w-5 h-5" style={{ color: '#6b7280' }} /></button>
        </div>
        <div className="p-6 flex flex-col gap-8">
          <section>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8eaed' }}>General</h3>
            <div className="flex flex-col gap-4">
              {(['dashboardName','ceoName'] as const).map(k => (
                <div key={k}>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#e8eaed' }}>{k === 'dashboardName' ? 'Dashboard Name' : 'CEO Name'}</label>
                  <input type="text" value={settings[k] as string} onChange={e => update(k, e.target.value as Settings[typeof k])}
                    className="w-full px-3 py-2 rounded text-sm outline-none"
                    style={{ background: '#1e2329', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#e8eaed' }}>Auto-reply Delay: {settings.autoReplyDelay}s</label>
                <input type="range" min="1" max="10" value={settings.autoReplyDelay} onChange={e => update('autoReplyDelay', +e.target.value)}
                  className="w-full" style={{ accentColor: '#00c9a7' }} />
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8eaed' }}>Notifications</h3>
            <div className="flex flex-col gap-3">
              {toggle('enableAlarms','Enable alarm lights')}
              {toggle('autoClearAlarms','Auto-clear alarms after reply')}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8eaed' }}>Display</h3>
            <div className="flex flex-col gap-3">
              {toggle('showLiveFeed','Show Live Feed')}
              {toggle('animateConnections','Animate node connections')}
              {toggle('showTaskSnippets','Show task snippets in sidebar')}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#ef4444' }}><AlertTriangle className="w-4 h-4" />Danger Zone</h3>
            <button onClick={() => { if (confirm('Reset all agents?')) onResetAgents(); }}
              className="w-full px-4 py-2 rounded text-sm font-medium" style={{ background: '#ef4444', color: '#fff' }}>Reset All Agents</button>
          </section>
        </div>
      </div>
    </div>
  );
}
