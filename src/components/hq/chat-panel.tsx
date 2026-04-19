"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Send, Bot, Crown, Star, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  provider: { name: string };
  model: { name: string; displayName: string };
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  CEO: <Crown className="h-3.5 w-3.5 text-yellow-400" />,
  CTO: <Star className="h-3.5 w-3.5 text-purple-400" />,
};

export function ChatPanel({ className }: { className?: string }) {
  const {
    selectedAgentId,
    chatMessages,
    isChatOpen,
    isAgentWorking,
    setChatOpen,
    setSelectedAgentId,
    addChatMessage,
  } = useAppStore();
  
  const [input, setInput] = useState("");
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = selectedAgentId ? chatMessages[selectedAgentId] || [] : [];

  useEffect(() => {
    if (selectedAgentId) {
      fetch(`/api/v1/agents/${selectedAgentId}`)
        .then((res) => res.json())
        .then((data) => setAgentInfo(data.data))
        .catch(() => {});
    } else {
      setAgentInfo(null);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId || sending) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    };
    
    addChatMessage(selectedAgentId, userMessage);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/v1/agents/${selectedAgentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: data.data.responseText || data.data.resultSummary || "No response received.",
        timestamp: new Date(),
      };
      addChatMessage(selectedAgentId, assistantMessage);
    } catch (err) {
      addChatMessage(selectedAgentId, {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: `Error: ${err instanceof Error ? err.message : "Failed to get response from agent."}`,
        timestamp: new Date(),
      });
    } finally {
      setSending(false);
    }
  };

  if (!isChatOpen || !selectedAgentId) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#484f58] p-6">
              <Bot className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No Agent Selected</p>
              <p className="text-xs mt-1">Select an agent from the roster to start chatting</p>
          </div>
      );
  }

  const isWorking = isAgentWorking[selectedAgentId];

  return (
    <div className={cn("flex-1 flex flex-col bg-[#0d0f12] overflow-hidden", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
            {ROLE_ICONS[agentInfo?.role || ""] || <Bot className="h-4 w-4 text-primary" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e2e8f0]">{agentInfo?.name || "Agent"}</div>
            <div className="text-[10px] text-[#8b949e]">
              {agentInfo?.role} · {agentInfo?.provider.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isWorking && (
            <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-400 py-0 gap-1 uppercase font-bold">
              <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
              Working
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8b949e] hover:text-[#e2e8f0]"
            onClick={() => { setChatOpen(false); setSelectedAgentId(null); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#484f58]">
            <Bot className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-bold uppercase tracking-widest text-[10px]">Neural Link Idle</p>
            <p className="text-xs mt-1">Ready for input with {agentInfo?.name}</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex chat-message-enter",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-primary/15 border border-primary/20 text-[#e2e8f0]"
                  : "bg-[#161b22] border border-white/5 text-[#e2e8f0]"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="h-4 w-4 flex items-center justify-center rounded-full bg-[#1e2430]">
                    {ROLE_ICONS[agentInfo?.role || ""] || <Bot className="h-2.5 w-2.5 text-[#8b949e]" />}
                  </div>
                  <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-tighter">{agentInfo?.name}</span>
                </div>
              )}
              <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <div className="text-[10px] text-[#484f58] mt-1.5 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </div>
            </div>
          </div>
        ))}
        {(sending || isWorking) && (
          <div className="flex justify-start chat-message-enter">
            <div className="bg-[#161b22] border border-white/5 rounded-lg px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-4 w-4 flex items-center justify-center rounded-full bg-[#1e2430]">
                  {ROLE_ICONS[agentInfo?.role || ""] || <Bot className="h-2.5 w-2.5 text-[#8b949e]" />}
                </div>
                <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-tighter">{agentInfo?.name}</span>
              </div>
              <div className="flex gap-1.5 py-1">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 bg-[#0d0f12]">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Signal transmission to ${agentInfo?.name || "agent"}...`}
            className="min-h-[40px] max-h-[120px] resize-none bg-[#161b22] border-white/10 text-[#e2e8f0] placeholder:text-[#484f58] text-sm focus:border-primary/50 transition-colors"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/80 text-black transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
