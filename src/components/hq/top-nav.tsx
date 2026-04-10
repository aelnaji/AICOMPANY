"use client";

import { useAppStore, type AppPage } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: { id: AppPage; label: string }[] = [
  { id: "team", label: "Team" },
  { id: "tasks", label: "Tasks" },
  { id: "connectors", label: "Connectors" },
  { id: "providers", label: "Providers" },
  { id: "models", label: "Models" },
  { id: "settings", label: "Settings" },
];

export function TopNav() {
  const { currentPage, setCurrentPage } = useAppStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-[#0d1117] px-4">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2 mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e] text-black">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">AI HQ</span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "relative px-4 py-2 text-sm font-medium rounded-md transition-colors",
                currentPage === item.id
                  ? "text-[#22c55e] bg-[#22c55e]/10"
                  : "text-[#8b949e] hover:text-[#e2e8f0] hover:bg-[#161b22]"
              )}
            >
              {item.label}
              {currentPage === item.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#22c55e]" />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-xs">
          Online
        </Badge>
      </div>
    </header>
  );
}
