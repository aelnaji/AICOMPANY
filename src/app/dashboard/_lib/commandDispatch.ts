import type { Agent, Message } from '../_types';

export function routeCommand(cmd: string, agents: Agent[]): Agent | undefined {
  const lower = cmd.toLowerCase();
  if (/(test|qa|spec|assert|coverage)/.test(lower))
    return agents.find(a => /qa/i.test(a.role)) ?? agents[0];
  if (/(db|sql|api|backend|schema|migrate|prisma)/.test(lower))
    return agents.find(a => /back/i.test(a.role)) ?? agents[0];
  if (/(ui|frontend|css|layout|component|style|react)/.test(lower))
    return agents.find(a => /front/i.test(a.role)) ?? agents[0];
  return agents.find(a => /lead|orchestrat/i.test(a.role)) ?? agents[0];
}

export async function dispatchCommandAsTask(cmd: string, targetAgent: Agent) {
  const res = await fetch('/api/v1/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: cmd.slice(0, 120),
      description: `Dispatched from AI HQ dashboard at ${new Date().toISOString()}`,
      assignedAgentId: targetAgent.id,
    }),
  });
  if (!res.ok) throw new Error('Task creation failed');
  const json = await res.json();
  return json.data;
}

export function buildAutoReply(cmd: string, task: { id: string }): Message {
  return {
    id: `reply-${Date.now()}`,
    sender: 'agent',
    text: `Task #${task.id.slice(0, 8)} created. Working on: ${cmd.slice(0, 60)}${cmd.length > 60 ? '...' : ''}`,
    timestamp: new Date(),
  };
}
