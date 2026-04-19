'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { mapApiAgent } from '../_lib/mappers';
import type { Agent, ActivityLog } from '../_types';

interface Stats {
  totalAgents: number;
  totalProviders: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
}

interface UseAICompanyDataProps {
  isPaused: boolean;
  onAgentsLoaded: (agents: Agent[]) => void;
  onActivityAppend: (log: ActivityLog) => void;
}

export function useAICompanyData({ isPaused, onAgentsLoaded, onActivityAppend }: UseAICompanyDataProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [providers, setProviders] = useState<{ id: string; name: string; type: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string; displayName: string; providerId: string }[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    const [agentsRes, tasksRes, statsRes, providersRes, modelsRes] = await Promise.all([
      fetch('/api/v1/agents').then(r => r.json()),
      fetch('/api/v1/tasks').then(r => r.json()),
      fetch('/api/v1/stats').then(r => r.json()),
      fetch('/api/v1/providers').then(r => r.json()),
      fetch('/api/v1/models').then(r => r.json()),
    ]);
    const agents = agentsRes.data ?? [];
    const tasks = tasksRes.data ?? [];
    setStats(statsRes.data ?? statsRes);
    setProviders(providersRes.data ?? []);
    setModels(modelsRes.data ?? []);
    const mapped = agents.map((a: Parameters<typeof mapApiAgent>[0]) => mapApiAgent(a, tasks));
    onAgentsLoaded(mapped);
    return { agents, tasks };
  }, [onAgentsLoaded]);

  useEffect(() => {
    fetchAll()
      .then(() => setError(null))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchAll]);

  // Poll every 8s when not paused
  useEffect(() => {
    if (isPaused) { if (pollRef.current) clearInterval(pollRef.current); return; }
    pollRef.current = setInterval(async () => {
      try {
        const { agents, tasks } = await fetchAll();
        const active = (tasks as { id: string; title: string; status: string; assignedAgentId: string; assignedAgent?: { name: string } }[]).filter(t => t.status === 'in_progress');
        if (active.length > 0) {
          const pick = active[Math.floor(Math.random() * active.length)];
          onActivityAppend({ id: `poll-${Date.now()}`, timestamp: new Date(), agentName: pick.assignedAgent?.name ?? 'Agent', action: pick.title });
        }
      } catch (_) { /* silent */ }
    }, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isPaused, fetchAll, onActivityAppend]);

  return { loading, error, stats, providers, models };
}
