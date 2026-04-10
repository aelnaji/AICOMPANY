"use client";

import { TopNav } from "@/components/hq/top-nav";
import { AgentRoster } from "@/components/hq/agent-roster";
import { ChatPanel } from "@/components/hq/chat-panel";
import { TeamPage } from "@/components/hq/team-page";
import { TasksPage } from "@/components/hq/tasks-page";
import { ConnectorsPage } from "@/components/hq/connectors-page";
import { ProvidersPage } from "@/components/hq/providers-page";
import { ModelsPage } from "@/components/hq/models-page";
import { SettingsPage } from "@/components/hq/settings-page";
import { useAppStore } from "@/lib/store";

export default function HomePage() {
  const { currentPage } = useAppStore();

  const renderPage = () => {
    switch (currentPage) {
      case "team":
        return <TeamPage />;
      case "tasks":
        return <TasksPage />;
      case "connectors":
        return <ConnectorsPage />;
      case "providers":
        return <ProvidersPage />;
      case "models":
        return <ModelsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <TeamPage />;
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0f]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <AgentRoster />
        {renderPage()}
        <ChatPanel />
      </div>
    </div>
  );
}
