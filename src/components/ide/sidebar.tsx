"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { FileTree } from "./file-tree";
import { AgentRoster } from "@/components/hq/agent-roster";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileIcon, UsersIcon } from "lucide-react";

export function Sidebar() {
  const { sidebarTab, setSidebarTab } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-[#0d0f12] border-r border-white/5">
      <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)} className="flex flex-col h-full">
        <TabsList className="bg-[#161b22] border-b border-white/5 rounded-none p-0 h-10">
          <TabsTrigger 
            value="files" 
            className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary transition-none h-full text-xs gap-2"
          >
            <FileIcon className="h-3.5 w-3.5" />
            Files
          </TabsTrigger>
          <TabsTrigger 
            value="agents" 
            className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary transition-none h-full text-xs gap-2"
          >
            <UsersIcon className="h-3.5 w-3.5" />
            Agents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
          <FileTree />
        </TabsContent>
        <TabsContent value="agents" className="flex-1 m-0 overflow-hidden">
          <AgentRoster className="border-none" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
