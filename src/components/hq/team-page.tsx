"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Crown, Star, Activity, CheckCircle2, Clock, Zap, TrendingUp } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  isActive: boolean;
  provider: { id: string; name: string; type: string };
  model: { id: string; name: string; displayName: string };
  _count: { tasks: number };
}

interface Stats {
  agentCount: number;
  providerCount: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeTasks: number;
  todoTasks: number;
  successRate: number;
}

const ROLE_COLORS: Record<string, string> = {
  CEO: "border-yellow-500/50 bg-yellow-500/10",
  CTO: "border-purple-500/50 bg-purple-500/10",
  BACKEND: "border-emerald-500/50 bg-emerald-500/10",
  FRONTEND: "border-cyan-500/50 bg-cyan-500/10",
  QA: "border-rose-500/50 bg-rose-500/10",
  DEVOPS: "border-orange-500/50 bg-orange-500/10",
  CISO: "border-red-500/50 bg-red-500/10",
  WRITER: "border-indigo-500/50 bg-indigo-500/10",
};

export function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const { setSelectedAgentId, setChatOpen } = useAppStore();

  useEffect(() => {
    fetch("/api/v1/agents").then((r) => r.json()).then((d) => setAgents(d.data || []));
    fetch("/api/v1/stats").then((r) => r.json()).then((d) => setStats(d.data));
  }, []);

  const openChat = (agentId: string) => {
    setSelectedAgentId(agentId);
    setChatOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#e2e8f0]">Team Overview</h1>
        <p className="text-sm text-[#8b949e]">Your AI workforce at a glance</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-[#0d1117] border-[#21262d]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[#8b949e] mb-1">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium">Total Agents</span>
              </div>
              <div className="text-2xl font-bold text-[#e2e8f0]">{stats.agentCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#0d1117] border-[#21262d]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[#8b949e] mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Active Tasks</span>
              </div>
              <div className="text-2xl font-bold text-[#e2e8f0]">{stats.activeTasks}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#0d1117] border-[#21262d]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[#8b949e] mb-1">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                <span className="text-xs font-medium">Completed</span>
              </div>
              <div className="text-2xl font-bold text-[#22c55e]">{stats.completedTasks}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#0d1117] border-[#21262d]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[#8b949e] mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-[#e2e8f0]">{stats.successRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agent Cards Grid */}
      <div>
        <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-3">Employees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="bg-[#0d1117] border-[#21262d] hover:border-[#30363d] transition-colors cursor-pointer group"
              onClick={() => openChat(agent.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                      agent.isActive ? "border-[#22c55e]/50 bg-[#22c55e]/10" : "border-[#484f58] bg-[#1e2430] opacity-50"
                    }`}>
                      {agent.role === "CEO" ? <Crown className="h-5 w-5 text-yellow-400" /> :
                       agent.role === "CTO" ? <Star className="h-5 w-5 text-purple-400" /> :
                       <Bot className="h-5 w-5 text-[#8b949e]" />}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d1117] ${
                      agent.isActive ? "bg-[#22c55e]" : "bg-[#484f58]"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#e2e8f0]">{agent.name}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${ROLE_COLORS[agent.role] || ""}`}>
                        {agent.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#8b949e] mt-0.5 truncate">{agent.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#484f58]">
                      <span>{agent.provider.name}</span>
                      <span>·</span>
                      <span>{agent.model.displayName || agent.model.name}</span>
                      <span>·</span>
                      <span>{agent._count.tasks} tasks</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="outline" className={`text-[10px] ${
                    agent.isActive ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]" : "border-[#484f58]/50 bg-[#484f58]/10 text-[#484f58]"
                  }`}>
                    {agent.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-[10px] text-[#484f58] group-hover:text-[#22c55e] transition-colors flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Chat
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
