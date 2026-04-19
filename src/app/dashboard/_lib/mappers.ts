import type { Agent } from '../_types';

interface ApiAgent {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  model: { id: string; name: string; displayName: string } | null;
  provider: { id: string; name: string; type: string } | null;
  _count: { tasks: number };
}

interface ApiTask {
  id: string;
  title: string;
  status: string;
  assignedAgentId: string;
}

export function mapApiAgent(a: ApiAgent, tasks: ApiTask[]): Agent {
  const agentTasks = tasks.filter(t => t.assignedAgentId === a.id);
  const activeTask = agentTasks.find(t => t.status === 'in_progress');
  const latestTask = activeTask ?? agentTasks[0];

  return {
    id: a.id,
    name: a.name,
    role: a.role,
    task: latestTask?.title ?? 'Standby',
    status: !a.isActive ? 'idle' : activeTask ? 'working' : 'idle',
    avatar: a.name
      .split(/[-\s]+/)
      .map(w => w[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join(''),
    _meta: {
      modelName: a.model?.displayName ?? a.model?.name ?? 'Unknown',
      providerName: a.provider?.name ?? 'Unknown',
      taskCount: a._count.tasks,
    },
  };
}
