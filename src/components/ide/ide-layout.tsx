"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

import { useAppStore } from "@/lib/store";
import { TeamPage } from "@/components/hq/team-page";
import { TasksPage } from "@/components/hq/tasks-page";
import { DashboardPage } from "@/components/hq/dashboard-page";
import { ConnectorsPage } from "@/components/hq/connectors-page";
import { ProvidersPage } from "@/components/hq/providers-page";
import { ModelsPage } from "@/components/hq/models-page";
import { SettingsPage } from "@/components/hq/settings-page";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sidebar = dynamic(() => import("./sidebar").then(m => m.Sidebar), { ssr: false });
const CodeEditor = dynamic(() => import("./editor").then(m => m.CodeEditor), { ssr: false });
const XTermTerminal = dynamic(() => import("./terminal").then(m => m.XTermTerminal), { ssr: false });
const OrchestrationPanel = dynamic(() => import("./orchestration-panel").then(m => m.OrchestrationPanel), { ssr: false });
const NeuralCanvas = dynamic(() => import("./neural-canvas").then(m => m.NeuralCanvas), { ssr: false });
const Analytics = dynamic(() => import("./analytics").then(m => m.Analytics), { ssr: false });
const ApprovalDialog = dynamic(() => import("./approval-dialog").then(m => m.ApprovalDialog), { ssr: false });

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeIcon, NetworkIcon, BarChart3Icon } from "lucide-react";

export function IDELayout() {
  const { currentPage, activeCenterTab, setActiveCenterTab } = useAppStore();

  const renderIDEContent = () => {
    return (
      <>
        <Tabs value={activeCenterTab} onValueChange={(v) => setActiveCenterTab(v as any)} className="flex flex-col h-full">
          <div className="flex items-center px-4 bg-[#0d0f12] border-b border-white/5 h-10">
            <TabsList className="bg-transparent h-full p-0 gap-6">
              <TabsTrigger 
                value="editor" 
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-0 text-[10px] font-bold uppercase tracking-widest gap-2"
              >
                <CodeIcon className="h-3.5 w-3.5" />
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="canvas" 
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-0 text-[10px] font-bold uppercase tracking-widest gap-2"
              >
                <NetworkIcon className="h-3.5 w-3.5" />
                Neural Canvas
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-0 text-[10px] font-bold uppercase tracking-widest gap-2"
              >
                <BarChart3Icon className="h-3.5 w-3.5" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="editor" className="flex-1 m-0 overflow-hidden">
            <CodeEditor />
          </TabsContent>
          <TabsContent value="canvas" className="flex-1 m-0 overflow-hidden">
            <NeuralCanvas />
          </TabsContent>
          <TabsContent value="analytics" className="flex-1 m-0 overflow-hidden">
            <Analytics />
          </TabsContent>
        </Tabs>
        <ApprovalDialog />
      </>
    );
  };

  const renderCenterZone = () => {
    switch (currentPage) {
      case "ide": return renderIDEContent();
      case "dashboard": return <div className="p-6 h-full overflow-auto"><DashboardPage /></div>;
      case "team": return <div className="p-6 h-full overflow-auto"><TeamPage /></div>;
      case "tasks": return <div className="p-6 h-full overflow-auto"><TasksPage /></div>;
      case "connectors": return <div className="p-6 h-full overflow-auto"><ConnectorsPage /></div>;
      case "providers": return <div className="p-6 h-full overflow-auto"><ProvidersPage /></div>;
      case "models": return <div className="p-6 h-full overflow-auto"><ModelsPage /></div>;
      case "settings": return <div className="p-6 h-full overflow-auto"><SettingsPage /></div>;
      default: return renderIDEContent();
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        {/* Left: Sidebar (File Tree & Agent Roster) */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <Sidebar />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Center & Bottom: Editor and Terminal */}
        <ResizablePanel defaultSize={55}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={30}>
              {renderCenterZone()}
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30} minSize={10}>
              <XTermTerminal />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right: Orchestration Panel */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <OrchestrationPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
