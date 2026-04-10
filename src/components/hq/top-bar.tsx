"use client";

import { Activity, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
          <Server className="h-3 w-3" />
          Development
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Activity className="h-3 w-3" />
          AI HQ v1.0
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          System Online
        </div>
      </div>
    </header>
  );
}
