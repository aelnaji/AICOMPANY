"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useResizeObserver } from "@reactuses/core";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LiveLogStream } from "./live-log-stream";
import { useAppStore } from "@/lib/store";
import { TerminalIcon, ListTreeIcon } from "lucide-react";

export function XTermTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddonInstance = useRef<FitAddon | null>(null);
  const [activeTab, setActiveTab] = useState("terminal");
  const { orchestrationLogs } = useAppStore();
  const lastLogId = useRef<string | null>(null);

  useResizeObserver(terminalRef, () => {
    if (fitAddonInstance.current && activeTab === "terminal") {
      fitAddonInstance.current.fit();
    }
  });

  useEffect(() => {
    if (termInstance.current && orchestrationLogs.length > 0) {
      const lastLog = orchestrationLogs[orchestrationLogs.length - 1];
      if (lastLog.id !== lastLogId.current) {
        lastLogId.current = lastLog.id;
        const color =
          lastLog.type === 'error'   ? '\x1b[31m' :
          lastLog.type === 'warning' ? '\x1b[33m' :
          lastLog.type === 'success' ? '\x1b[32m' : '\x1b[36m';
        termInstance.current.writeln(`\r\n${color}[${lastLog.agentId}]\x1b[0m ${lastLog.message}`);
        termInstance.current.write("\x1b[1;36m\u27a4\x1b[0m \x1b[1;32m~/project\x1b[0m ");
      }
    }
  }, [orchestrationLogs]);

  useEffect(() => {
    if (!terminalRef.current || activeTab !== "terminal" || termInstance.current) return;

    const initTerminal = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");

      const term = new Terminal({
        cursorBlink: true,
        theme: {
          background: "#0d0f12",
          foreground: "#00c9a7",
          cursor: "#00c9a7",
          selectionBackground: "rgba(0, 201, 167, 0.3)",
        },
        fontSize: 12,
        fontFamily: "var(--font-mono)",
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      termInstance.current = term;
      fitAddonInstance.current = fitAddon;

      if (terminalRef.current) {
        term.open(terminalRef.current);
        setTimeout(() => fitAddon.fit(), 0);
      }

      term.writeln("\x1b[32mWelcome to Neural HQ Terminal\x1b[0m");
      term.writeln("\x1b[90m$ Initializing neural shell...\x1b[0m");
      term.write("\r\n\x1b[1;36m\u27a4\x1b[0m \x1b[1;32m~/project\x1b[0m ");

      term.onData((data: string) => {
        if (data === "\r") {
          term.write("\r\n\x1b[1;36m\u27a4\x1b[0m \x1b[1;32m~/project\x1b[0m ");
        } else if (data === "\u007f") {
          term.write("\b \b");
        } else {
          term.write(data);
        }
      });

      const handleResize = () => fitAddon.fit();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        term.dispose();
        termInstance.current = null;
        fitAddonInstance.current = null;
      };
    };

    const cleanupPromise = initTerminal();
    return () => { cleanupPromise.then(cleanup => cleanup && cleanup()); };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0d0f12]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="flex items-center px-4 py-0 border-b border-white/5 bg-background/50 h-9">
          <TabsList className="bg-transparent h-full p-0 gap-4">
            <TabsTrigger
              value="terminal"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-0 text-[10px] font-bold uppercase tracking-widest gap-2"
            >
              <TerminalIcon className="h-3 w-3" />
              Terminal
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-0 text-[10px] font-bold uppercase tracking-widest gap-2"
            >
              <ListTreeIcon className="h-3 w-3" />
              Logs
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="terminal" className="flex-1 m-0 overflow-hidden relative">
          <div ref={terminalRef} className="absolute inset-0 p-2" />
        </TabsContent>
        <TabsContent value="logs" className="flex-1 m-0 overflow-hidden">
          <LiveLogStream />
        </TabsContent>
      </Tabs>
    </div>
  );
}
