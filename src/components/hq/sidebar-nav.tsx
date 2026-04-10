"use client";

import { useAppStore, type AppPage } from "@/lib/store";
import {
  LayoutDashboard,
  Bot,
  ListTodo,
  Globe,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems: { id: AppPage; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "agents", label: "Agents", icon: <Bot className="h-5 w-5" /> },
  { id: "tasks", label: "Tasks", icon: <ListTodo className="h-5 w-5" /> },
  { id: "providers", label: "Providers", icon: <Globe className="h-5 w-5" /> },
  { id: "models", label: "Models", icon: <Cpu className="h-5 w-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export function SidebarNav() {
  const { currentPage, setCurrentPage, sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold tracking-tight">AI HQ</span>
            <span className="truncate text-xs text-muted-foreground">Command Center</span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const button = (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                !sidebarOpen && "justify-center px-2",
                isActive && "font-semibold"
              )}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className={cn("shrink-0", isActive && "text-primary")}>
                {item.icon}
              </span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Button>
          );

          if (!sidebarOpen) {
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return button;
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
