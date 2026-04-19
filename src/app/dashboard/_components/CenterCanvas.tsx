'use client';
import type { Agent, ActivityLog, Settings } from '../_types';
import { format } from 'date-fns';

type Props = {
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  activityLog: ActivityLog[];
  currentTime: Date;
  isPaused: boolean;
  settings: Settings;
};

export function CenterCanvas({ agents, selectedAgentId, onSelectAgent, activityLog, currentTime, isPaused, settings }: Props) {
  const cx = 400, cy = 300, r = 180;
  const positions = agents.map((agent, i) => {
    const angle = (i / agents.length) * 2 * Math.PI - Math.PI / 2;
    return { agent, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const ceo = { x: cx, y: cy + 100 };

  const ringColor = (s: Agent['status']) => {
    if (isPaused) return '#4b5563';
    return s === 'working' ? '#00c9a7' : s === 'alarm' ? '#ef4444' : s === 'ceo-calling' ? '#f5a623' : '#4b5563';
  };

  const active = agents.filter(a => !isPaused && a.status === 'working').length;
  const util = Math.round((active / Math.max(agents.length, 1)) * 100);

  return (
    <div className="flex-1 h-full flex flex-col" style={{ background: '#0d0f12' }}>
      <div className="h-16 border-b px-6 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-6">
          <div className="text-sm" style={{ color: '#e8eaed' }}>{format(currentTime, 'MMM dd, yyyy • HH:mm:ss')}</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: isPaused ? '#4b5563' : '#22c55e', boxShadow: isPaused ? 'none' : '0 0 6px #22c55e' }} />
            <span className="text-xs font-medium" style={{ color: isPaused ? '#6b7280' : '#22c55e' }}>{isPaused ? 'PAUSED' : 'LIVE'}</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div style={{ color: '#6b7280' }}>Team: <span style={{ color: '#e8eaed' }}>{agents.length}</span></div>
          <div style={{ color: '#6b7280' }}>Active: <span style={{ color: '#e8eaed' }}>{active}</span></div>
          <div className="flex items-center gap-2">
            <span style={{ color: '#6b7280' }}>Util:</span>
            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: '#1e2329' }}>
              <div className="h-full transition-all" style={{ width: `${util}%`, background: '#00c9a7' }} />
            </div>
            <span style={{ color: '#e8eaed' }}>{util}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
        <svg className="w-full h-full" viewBox="0 0 800 600">
          {settings.animateConnections && positions.map(({ agent, x, y }) =>
            agent.status === 'ceo-calling' && !isPaused ? (
              <line key={`l-${agent.id}`} x1={ceo.x} y1={ceo.y} x2={x} y2={y} stroke="#f5a623" strokeWidth="2" strokeDasharray="5,5" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="0.5s" repeatCount="indefinite" />
              </line>
            ) : null
          )}

          {positions.map(({ agent, x, y }) => (
            <g key={agent.id} onClick={() => onSelectAgent(agent.id)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="34" fill="none" stroke={ringColor(agent.status)} strokeWidth="3" opacity={agent.status === 'alarm' || agent.status === 'ceo-calling' ? '1' : '0.6'}>
                {!isPaused && agent.status === 'working' && <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />}
                {agent.status === 'alarm' && <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />}
                {agent.status === 'ceo-calling' && <animate attributeName="r" values="34;38;34" dur="1s" repeatCount="indefinite" />}
              </circle>
              <circle cx={x} cy={y} r="28" fill="#161a1f" stroke={selectedAgentId === agent.id ? '#00c9a7' : 'rgba(255,255,255,0.1)'} strokeWidth={selectedAgentId === agent.id ? 2 : 1} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#e8eaed" fontSize="12" fontWeight="600">{agent.avatar}</text>
              <text x={x} y={y + 50} textAnchor="middle" fill="#e8eaed" fontSize="11" fontWeight="500">{agent.name}</text>
              <text x={x} y={y + 65} textAnchor="middle" fill="#6b7280" fontSize="9">{agent.role}</text>
            </g>
          ))}

          <g>
            <polygon points={`${ceo.x},${ceo.y-30} ${ceo.x+26},${ceo.y-15} ${ceo.x+26},${ceo.y+15} ${ceo.x},${ceo.y+30} ${ceo.x-26},${ceo.y+15} ${ceo.x-26},${ceo.y-15}`}
              fill="#161a1f" stroke="#f5a623" strokeWidth="3" />
            <text x={ceo.x} y={ceo.y} textAnchor="middle" dominantBaseline="middle" fill="#f5a623" fontSize="12" fontWeight="700">CEO</text>
            <text x={ceo.x} y={ceo.y + 50} textAnchor="middle" fill="#f5a623" fontSize="11" fontWeight="600">{settings.ceoName}</text>
          </g>
        </svg>
      </div>

      {settings.showLiveFeed && (
        <div className="h-32 border-t px-6 py-3 overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#161a1f', fontFamily: 'monospace' }}>
          <div className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>LIVE ACTIVITY FEED</div>
          <div className="flex flex-col gap-1 overflow-y-auto h-20">
            {activityLog.slice(-8).reverse().map(log => (
              <div key={log.id} className="text-xs flex items-center gap-2" style={{ color: '#e8eaed' }}>
                <span style={{ color: '#6b7280' }}>[{format(log.timestamp, 'HH:mm:ss')}]</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'rgba(0,201,167,0.2)', color: '#00c9a7' }}>TOOL</span>
                <span style={{ color: '#6b7280' }}>–</span>
                <span>{log.agentName}:</span>
                <span style={{ color: '#6b7280' }}>{log.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
