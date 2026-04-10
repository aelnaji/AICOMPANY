"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Bot, Crown, Star, Pencil, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AgentEditDialog } from "./agent-edit-dialog";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  isActive: boolean;
  providerId: string;
  modelId: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  mcpConfig: string;
  tools: string;
  provider: { name: string };
  model: { name: string; displayName: string };
  _count: { tasks: number };
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  CEO: <Crown className="h-3.5 w-3.5 text-yellow-400" />,
  CTO: <Star className="h-3.5 w-3.5 text-purple-400" />,
};

export function AgentRoster() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedAgentId, setSelectedAgentId, isAgentWorking } = useAppStore();

  const refreshAgents = () => {
    fetch("/api/v1/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    refreshAgents();
  }, []);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-[#0d1117] flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Employee Roster</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {agents.map((agent) => {
            const isWorking = isAgentWorking[agent.id];
            const isSelected = selectedAgentId === agent.id;
            return (
              <div
                key={agent.id}
                className={cn(
                  "group relative w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#22c55e]/10 border border-[#22c55e]/30 glow-green"
                    : "hover:bg-[#161b22] border border-transparent"
                )}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <div className="relative mt-0.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border",
                      isSelected
                        ? "bg-[#22c55e]/20 border-[#22c55e]/50"
                        : agent.isActive
                        ? "bg-[#1e2430] border-[#30363d]"
                        : "bg-[#1e2430] border-[#21262d] opacity-50"
                    )}
                  >
                    {ROLE_ICONS[agent.role] || <Bot className="h-4 w-4 text-[#8b949e]" />}
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d1117]",
                      isWorking
                        ? "bg-amber-400 animate-pulse"
                        : agent.isActive
                        ? "bg-[#22c55e]"
                        : "bg-[#484f58]"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isSelected ? "text-[#22c55e]" : "text-[#e2e8f0]"
                    )}>
                      {agent.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e] truncate">{agent.role}</p>
                  <p className="text-[10px] text-[#484f58] truncate mt-0.5">{agent.provider.name} · {agent.model.displayName || agent.model.name}</p>
                  {isWorking && (
                    <Badge variant="outline" className="mt-1 text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-400 py-0">
                      Working...
                    </Badge>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditAgent(agent);
                    setDialogOpen(true);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-[#e2e8f0]"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-border space-y-2">
        <Button
          onClick={() => {
            setEditAgent(null);
            setDialogOpen(true);
          }}
          className="w-full bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20 text-xs h-8"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          Hire Employee
        </Button>
        <div className="text-xs text-[#484f58] text-center">
          {agents.length} agent{agents.length !== 1 ? "s" : ""} · {agents.filter((a) => a.isActive).length} active
        </div>
      </div>

      <AgentEditDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditAgent(null);
        }}
        agent={editAgent}
        onSaved={refreshAgents}
      />
    </aside>
  );
}
