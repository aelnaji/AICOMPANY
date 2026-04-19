"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Bot, Crown, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  role: string;
}

interface CanvasNode {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
}

export function NeuralCanvas() {
  const { delegations, isAgentWorking } = useAppStore();
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch agents ONCE on mount only — status comes from Zustand
  useEffect(() => {
    fetch("/api/v1/agents")
      .then((res) => res.json())
      .then((data) => {
        const agents: Agent[] = data.data || [];
        const mappedNodes: CanvasNode[] = agents.map((agent, index) => {
          const angle = (index / agents.length) * 2 * Math.PI;
          const radius = 150;
          return {
            id: agent.id,
            name: agent.name,
            role: agent.role,
            x: 250 + radius * Math.cos(angle),
            y: 250 + radius * Math.sin(angle),
          };
        });
        setNodes(mappedNodes);
      })
      .catch((err) => console.error("Failed to fetch agents for canvas", err));
  }, []); // empty dep array — fetch once only

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0d0f12] overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="h-full w-full bg-[radial-gradient(#1e2430_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c9a7" stopOpacity="0" />
            <stop offset="50%" stopColor="#00c9a7" stopOpacity="1" />
            <stop offset="100%" stopColor="#00c9a7" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <AnimatePresence>
          {delegations.map((delegation) => {
            const fromNode = nodes.find(n => n.id === delegation.from);
            const toNode = nodes.find(n => n.id === delegation.to);
            if (!fromNode || !toNode) return null;
            return (
              <motion.g key={delegation.id}>
                <motion.line
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x} y2={toNode.y}
                  stroke="rgba(0, 201, 167, 0.2)"
                  strokeWidth="1"
                />
                <motion.circle
                  r="3"
                  fill="#00c9a7"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: `path('M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}')` }}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>

      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: node.x, top: node.y }}
          whileHover={{ scale: 1.1 }}
        >
          <div className="relative">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-lg transition-colors",
              isAgentWorking[node.id]
                ? "bg-primary/20 border-primary animate-pulse"
                : "bg-[#161b22] border-white/10"
            )}>
              {node.role === "CEO" ? <Crown className="h-6 w-6 text-yellow-400" /> :
               node.role === "CTO" ? <Star className="h-6 w-6 text-purple-400" /> :
               <Bot className="h-6 w-6 text-primary" />}
            </div>
            {isAgentWorking[node.id] && (
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 shadow-lg">
                <Zap className="h-2 w-2 text-white animate-pulse" />
              </div>
            )}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <div className="text-[10px] font-bold text-white/90 uppercase tracking-tighter">{node.name}</div>
              <div className="text-[8px] text-muted-foreground">{node.role}</div>
            </div>
          </div>
        </motion.div>
      ))}

      <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#161b22]/80 backdrop-blur border border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_#00c9a7]"></div>
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_#f59e0b]"></div>
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Delegating</span>
          </div>
          <div className="flex-1"></div>
          <div className="text-[10px] uppercase font-black text-primary tracking-tighter italic">Neural Engine v2.4</div>
        </div>
      </div>
    </div>
  );
}
