"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore, type AppPage } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Sparkles, LayoutDashboard, Code2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems: { id: AppPage; label: string; icon?: any }[] = [
  { id: "ide", label: "Neural IDE", icon: Code2Icon },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "team", label: "Team" },
  { id: "tasks", label: "Tasks" },
  { id: "connectors", label: "Connectors" },
  { id: "providers", label: "Providers" },
  { id: "models", label: "Models" },
  { id: "settings", label: "Settings" },
];

export function TopNav() {
  const { currentPage, setCurrentPage } = useAppStore();
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  return (
    <header className="flex h-12 items-center justify-between border-b border-white/5 bg-[#0d0f12] px-4 backdrop-blur-md bg-opacity-80 sticky top-0 z-50">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2 mr-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex h-7 w-7 items-center justify-center rounded bg-primary text-black">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <span className="font-black text-xs tracking-[0.3em] text-white uppercase italic">Neural HQ</span>
        </div>
        
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "relative flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all",
                !isDashboard && currentPage === item.id
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {item.icon && <item.icon className="h-3 w-3" />}
              {item.label}
              {!isDashboard && currentPage === item.id && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(0,201,167,0.5)]" 
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">System Status</span>
            <span className="text-[9px] text-primary font-mono leading-none">All Systems Nominal</span>
        </div>
        <Badge
          variant="outline"
          className="text-[9px] uppercase font-black tracking-[0.1em] border-primary/30 bg-primary/5 text-primary py-0 px-2 h-5 flex items-center gap-1.5 shadow-[0_0_5px_rgba(0,201,167,0.1)]"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Neural Link
        </Badge>
      </div>
    </header>
  );
}
