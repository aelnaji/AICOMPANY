"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LiveLogStream() {
  const { orchestrationLogs } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [orchestrationLogs]);

  return (
    <div className="flex flex-col h-full bg-[#0d0f12] text-[11px] font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-[#161b22]/50">
        <span className="uppercase tracking-widest text-muted-foreground font-bold">Live Execution Stream</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[9px] text-primary/70">CONNECTED</span>
        </div>
      </div>
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-3 space-y-1">
          {orchestrationLogs.map((log) => (
            <div key={log.id} className="flex gap-3 group">
              <span className="text-[#484f58] shrink-0">{format(log.timestamp, "HH:mm:ss.SSS")}</span>
              <span className={cn(
                "font-bold shrink-0 w-20 truncate",
                log.type === 'error' ? "text-red-400" : 
                log.type === 'warning' ? "text-amber-400" : 
                log.type === 'success' ? "text-primary" : "text-blue-400"
              )}>
                [{log.agentId}]
              </span>
              <span className={cn(
                "break-all",
                log.type === 'error' ? "text-red-400/90" : 
                log.type === 'warning' ? "text-amber-400/90" : 
                log.type === 'success' ? "text-primary/90" : "text-white/80"
              )}>
                {log.message}
              </span>
            </div>
          ))}
          {orchestrationLogs.length === 0 && (
            <div className="text-[#484f58] italic py-2">Waiting for system signals...</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
