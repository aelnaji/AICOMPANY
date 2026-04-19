'use client';
import { useState, useEffect, useCallback } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { CenterCanvas } from './CenterCanvas';
import { RightPanel } from './RightPanel';
import { AddAgentModal } from './AddAgentModal';
import { SettingsPanel } from './SettingsPanel';
import { useAICompanyData } from '../_hooks/useAICompanyData';
import { routeCommand, dispatchCommandAsTask, buildAutoReply } from '../_lib/commandDispatch';
import type { Agent, Message, ActivityLog, Settings } from '../_types';

export default function DashboardClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [messagesByAgent, setMessagesByAgent] = useState<Record<string, Message[]>>({});
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    dashboardName: 'AI Operations HQ',
    ceoName: 'CEO',
    autoReplyDelay: 3,
    enableAlarms: true,
    soundOnQuestion: false,
    autoClearAlarms: true,
    showLiveFeed: true,
    animateConnections: true,
    showTaskSnippets: true,
  });

  const handleAgentsLoaded = useCallback((loaded: Agent[]) => {
    setAgents(prev =>
      loaded.map(incoming => {
        const existing = prev.find(p => p.id === incoming.id);
        if (existing && (existing.status === 'alarm' || existing.status === 'ceo-calling'))
          return { ...incoming, status: existing.status };
        return incoming;
      })
    );
    setSelectedAgentId(prev => prev || loaded[0]?.id || '');
  }, []);

  const handleActivityAppend = useCallback((log: ActivityLog) => {
    setActivityLog(prev => [...prev.slice(-20), log]);
  }, []);

  const { loading, error, stats, providers, models } = useAICompanyData({
    isPaused,
    onAgentsLoaded: handleAgentsLoaded,
    onActivityAppend: handleActivityAppend,
  });

  // Clock
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Local activity simulation
  useEffect(() => {
    if (isPaused || agents.length === 0) return;
    const actions = ['Ran command', 'Read file', 'Found files', 'Wrote file', 'Executed task', 'Updated schema'];
    const id = setInterval(() => {
      const a = agents[Math.floor(Math.random() * agents.length)];
      if (a.status !== 'working') return;
      setActivityLog(prev => [...prev.slice(-20), { id: `sim-${Date.now()}`, timestamp: new Date(), agentName: a.name, action: actions[Math.floor(Math.random() * actions.length)] }]);
    }, 4000);
    return () => clearInterval(id);
  }, [isPaused, agents]);

  const handleSendMessage = async (text: string, agentId: string) => {
    const isQuestion = text.trim().endsWith('?');
    const ceoMsg: Message = { id: `msg-${Date.now()}`, sender: 'ceo', text, timestamp: new Date() };
    setMessagesByAgent(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), ceoMsg] }));

    if (isQuestion && settings.enableAlarms) {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'alarm' } : a));
      setTimeout(() => {
        const reply: Message = { id: `reply-${Date.now()}`, sender: 'agent', text: `Analyzing: "${text.slice(0, 40)}..." — preparing response.`, timestamp: new Date() };
        setMessagesByAgent(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), reply] }));
        if (settings.autoClearAlarms)
          setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'working' } : a));
      }, settings.autoReplyDelay * 1000);
    } else {
      const target = routeCommand(text, agents) ?? agents.find(a => a.id === agentId);
      if (target) {
        setAgents(prev => prev.map(a => a.id === target.id ? { ...a, status: 'ceo-calling' } : a));
        try {
          const task = await dispatchCommandAsTask(text, target);
          const reply = buildAutoReply(text, task);
          setMessagesByAgent(prev => ({ ...prev, [target.id]: [...(prev[target.id] || []), reply] }));
          setActivityLog(prev => [...prev.slice(-20), { id: `cmd-${Date.now()}`, timestamp: new Date(), agentName: target.name, action: `Task: ${text.slice(0, 40)}` }]);
        } catch {
          const fallback: Message = { id: `fb-${Date.now()}`, sender: 'agent', text: 'Acknowledged. Processing directive now.', timestamp: new Date() };
          setMessagesByAgent(prev => ({ ...prev, [target.id]: [...(prev[target.id] || []), fallback] }));
        }
        setTimeout(() => setAgents(prev => prev.map(a => a.id === target.id ? { ...a, status: 'working' } : a)), 2000);
      }
    }
  };

  const handleAddAgent = (agentData: Omit<Agent, 'id'>) => {
    setAgents(prev => [...prev, { ...agentData, id: `local-${Date.now()}` }]);
    setIsAddAgentModalOpen(false);
  };

  if (loading && agents.length === 0) {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: '#0d0f12' }}>
        <div className="text-center">
          <div className="text-sm font-mono mb-2" style={{ color: '#00c9a7' }}>LOADING AI OPERATIONS HQ...</div>
          <div className="text-xs" style={{ color: '#6b7280' }}>Connecting to AICOMPANY API</div>
        </div>
      </div>
    );
  }

  if (error && agents.length === 0) {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: '#0d0f12' }}>
        <div className="text-center max-w-sm">
          <div className="text-sm font-mono mb-2" style={{ color: '#ef4444' }}>API ERROR</div>
          <div className="text-xs" style={{ color: '#6b7280' }}>{error}</div>
        </div>
      </div>
    );
  }

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="size-full flex overflow-hidden" style={{ background: '#0d0f12' }}>
      <LeftSidebar
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onOpenAddAgent={() => setIsAddAgentModalOpen(true)}
        onOpenSettings={() => setIsSettingsPanelOpen(true)}
        settings={settings}
        stats={stats}
      />
      <CenterCanvas
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
        activityLog={activityLog}
        currentTime={currentTime}
        isPaused={isPaused}
        settings={settings}
      />
      <RightPanel
        agent={selectedAgent}
        agents={agents}
        messages={messagesByAgent[selectedAgentId] || []}
        onSendMessage={text => handleSendMessage(text, selectedAgentId)}
        onSelectAgent={setSelectedAgentId}
        settings={settings}
      />
      {isAddAgentModalOpen && (
        <AddAgentModal
          onClose={() => setIsAddAgentModalOpen(false)}
          onAdd={handleAddAgent}
          providers={providers}
          models={models}
        />
      )}
      {isSettingsPanelOpen && (
        <SettingsPanel
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setIsSettingsPanelOpen(false)}
          onResetAgents={() => { setAgents([]); setMessagesByAgent({}); setSelectedAgentId(''); }}
        />
      )}
    </div>
  );
}
