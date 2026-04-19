"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import {
  MessageSquareIcon,
  ListIcon,
  ClipboardListIcon
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/components/hq/chat-panel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function OrchestrationPanel() {
  const {
    delegations,
    selectedAgentId,
    orchestrationTab,
    setOrchestrationTab
  } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-[#0d0f12]">
      <Tabs
        value={orchestrationTab}
        onValueChange={(v) => setOrchestrationTab(v as "chat" | "tasks")}
        className="flex flex-col h-full"
      >
        <div className="flex items-center px-4 bg-[#161b22] border-b border-white/5 h-10">
          <TabsList className="bg-transparent h-full p-0 gap-4">
            <TabsTrigger
              value="chat"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-0 text-[10px] font-bold uppercase tracking-widest gap-2"
            >
              <MessageSquareIcon className="h-3.5 w-3.5" />
              Agent Chat
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-0 text-[10px] font-bold uppercase tracking-widest gap-2"
            >
              <ClipboardListIcon className="h-3.5 w-3.5" />
              Task Inspector
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
          {selectedAgentId ? (
            <ChatPanel className="border-none h-full" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <div className="p-4 rounded-full bg-white/5 border border-white/10">
                <MessageSquareIcon className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/50 uppercase tracking-tighter">No Active Channel</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Select an agent to begin comms</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                <ListIcon className="h-3 w-3" />
                Active Directives
              </h3>
              {delegations.length === 0 ? (
                <div className="text-center py-10 opacity-30 italic text-xs">No active tasks in pipeline</div>
              ) : (
                delegations.map((delegation) => (
                  <div key={delegation.id} className="p-3 rounded-lg border border-white/5 bg-[#161b22] space-y-2 group">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cn(
                        "text-[9px] uppercase font-black",
                        delegation.status === 'completed' ? "border-primary text-primary" : "border-amber-500 text-amber-500"
                      )}>
                        {delegation.status}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-mono">ID: {delegation.id}</span>
                    </div>
                    <p className="text-xs font-medium text-white/90 leading-relaxed">{delegation.task}</p>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-2">
                      <div className="text-[8px] uppercase font-bold text-muted-foreground">From: <span className="text-white/70">{delegation.from}</span></div>
                      <div className="text-[8px] uppercase font-bold text-muted-foreground ml-auto">To: <span className="text-primary">{delegation.to}</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
