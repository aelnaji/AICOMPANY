"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  displayName: string;
  providerId: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  providerId: string;
  modelId: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  isActive: boolean;
  mcpConfig: string;
  tools: string;
}

const ROLES = ["CEO", "CTO", "BACKEND", "FRONTEND", "QA", "DEVOPS", "CISO", "WRITER", "CUSTOM"];

const MCP_TEMPLATE = `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}`;

const TOOLS_TEMPLATE = `[
  {
    "name": "web_search",
    "description": "Search the web for information",
    "parameters": {
      "query": { "type": "string", "description": "Search query" }
    }
  },
  {
    "name": "code_execute",
    "description": "Execute code in a sandbox",
    "parameters": {
      "language": { "type": "string", "description": "Programming language" },
      "code": { "type": "string", "description": "Code to execute" }
    }
  },
  {
    "name": "file_read",
    "description": "Read file contents",
    "parameters": {
      "path": { "type": "string", "description": "File path" }
    }
  },
  {
    "name": "file_write",
    "description": "Write content to a file",
    "parameters": {
      "path": { "type": "string", "description": "File path" },
      "content": { "type": "string", "description": "File content" }
    }
  }
]`;

interface AgentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent | null;
  onSaved: () => void;
}

interface FormData {
  name: string;
  role: string;
  description: string;
  providerId: string;
  modelId: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  isActive: boolean;
  mcpConfig: string;
  tools: string;
}

const defaultFormData: FormData = {
  name: "",
  role: "CUSTOM",
  description: "",
  providerId: "",
  modelId: "",
  systemPrompt: "",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 4096,
  isActive: true,
  mcpConfig: MCP_TEMPLATE,
  tools: TOOLS_TEMPLATE,
};

export function AgentEditDialog({ open, onOpenChange, agent, onSaved }: AgentEditDialogProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    fetch("/api/v1/providers").then((r) => r.json()).then((d) => setProviders(d.data || []));
    fetch("/api/v1/models").then((r) => r.json()).then((d) => setModels(d.data || []));
  }, []);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        role: agent.role,
        description: agent.description,
        providerId: agent.providerId,
        modelId: agent.modelId,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        topP: agent.topP,
        maxTokens: agent.maxTokens,
        isActive: agent.isActive,
        mcpConfig: agent.mcpConfig || MCP_TEMPLATE,
        tools: agent.tools || TOOLS_TEMPLATE,
      });
    } else {
      setFormData(defaultFormData);
    }
    setActiveTab("basic");
  }, [agent, open]);

  const filteredModels = models.filter((m) => m.providerId === formData.providerId);

  const handleSubmit = async () => {
    if (!formData.name || !formData.providerId || !formData.modelId) {
      toast.error("Name, provider, and model are required");
      return;
    }

    // Validate JSON for MCP config
    if (formData.mcpConfig.trim()) {
      try {
        JSON.parse(formData.mcpConfig);
      } catch {
        toast.error("MCP Config must be valid JSON");
        return;
      }
    }

    // Validate JSON for tools
    if (formData.tools.trim()) {
      try {
        JSON.parse(formData.tools);
      } catch {
        toast.error("Tools & Skills must be valid JSON");
        return;
      }
    }

    setSubmitting(true);
    try {
      const url = agent ? `/api/v1/agents/${agent.id}` : "/api/v1/agents";
      const method = agent ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save agent");
      toast.success(agent ? "Agent updated" : "Agent created");
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Failed to save agent");
    } finally {
      setSubmitting(false);
    }
  };

  const loadTemplate = (type: "mcp" | "tools") => {
    if (type === "mcp") {
      setFormData((prev) => ({ ...prev, mcpConfig: MCP_TEMPLATE }));
    } else {
      setFormData((prev) => ({ ...prev, tools: TOOLS_TEMPLATE }));
    }
    toast.success("Template loaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{agent ? `Edit ${agent.name}` : "Create New Agent"}</DialogTitle>
          <DialogDescription>
            {agent ? "Update agent configuration" : "Add a new AI agent to your team"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#161b22] w-full grid grid-cols-4">
            <TabsTrigger value="basic" className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Basic</TabsTrigger>
            <TabsTrigger value="prompt" className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Prompt</TabsTrigger>
            <TabsTrigger value="mcp" className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">MCP</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Tools</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Name *</Label>
                <Input
                  id="agent-name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="AGENT-CUSTOM"
                  className="bg-[#161b22] border-[#21262d] text-[#e2e8f0]"
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData((p) => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-[#161b22] border-[#21262d] text-[#e2e8f0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief role description"
                className="bg-[#161b22] border-[#21262d] text-[#e2e8f0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider *</Label>
                <Select value={formData.providerId} onValueChange={(v) => setFormData((p) => ({ ...p, providerId: v, modelId: "" }))}>
                  <SelectTrigger className="bg-[#161b22] border-[#21262d] text-[#e2e8f0]">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model *</Label>
                <Select value={formData.modelId} onValueChange={(v) => setFormData((p) => ({ ...p, modelId: v }))}>
                  <SelectTrigger className="bg-[#161b22] border-[#21262d] text-[#e2e8f0]">
                    <SelectValue placeholder={formData.providerId ? "Select model" : "Pick provider first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredModels.map((m) => <SelectItem key={m.id} value={m.id}>{m.displayName || m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Temperature: {formData.temperature}</Label>
                <Input type="range" min="0" max="2" step="0.1" value={formData.temperature}
                  onChange={(e) => setFormData((p) => ({ ...p, temperature: parseFloat(e.target.value) }))}
                  className="cursor-pointer" />
              </div>
              <div className="space-y-2">
                <Label>Top P: {formData.topP}</Label>
                <Input type="range" min="0" max="1" step="0.05" value={formData.topP}
                  onChange={(e) => setFormData((p) => ({ ...p, topP: parseFloat(e.target.value) }))}
                  className="cursor-pointer" />
              </div>
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input type="number" min="1" max="200000" value={formData.maxTokens}
                  onChange={(e) => setFormData((p) => ({ ...p, maxTokens: parseInt(e.target.value) || 4096 }))}
                  className="bg-[#161b22] border-[#21262d] text-[#e2e8f0]" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: v }))} />
              <Label>Agent is active</Label>
            </div>
          </TabsContent>

          {/* Prompt Tab */}
          <TabsContent value="prompt" className="mt-4">
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData((p) => ({ ...p, systemPrompt: e.target.value }))}
                placeholder="Define how this agent should behave..."
                rows={14}
                className="font-mono text-xs bg-[#161b22] border-[#21262d] text-[#e2e8f0] placeholder:text-[#484f58]"
              />
              <p className="text-[10px] text-[#484f58]">
                This prompt defines the agent&apos;s personality and behavior when responding to messages.
              </p>
            </div>
          </TabsContent>

          {/* MCP Tab */}
          <TabsContent value="mcp" className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>MCP Server Configuration</Label>
                  <p className="text-[10px] text-[#484f58] mt-0.5">
                    Model Context Protocol servers for tool execution
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] text-[#8b949e] h-7" onClick={() => loadTemplate("mcp")}>
                  Load Template
                </Button>
              </div>
              <Textarea
                value={formData.mcpConfig}
                onChange={(e) => setFormData((p) => ({ ...p, mcpConfig: e.target.value }))}
                placeholder="MCP server configuration JSON..."
                rows={12}
                className="font-mono text-xs bg-[#161b22] border-[#21262d] text-primary placeholder:text-[#484f58]"
              />
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tools & Skills</Label>
                  <p className="text-[10px] text-[#484f58] mt-0.5">
                    JSON array of tools this agent can use
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] text-[#8b949e] h-7" onClick={() => loadTemplate("tools")}>
                  Load Template
                </Button>
              </div>
              <Textarea
                value={formData.tools}
                onChange={(e) => setFormData((p) => ({ ...p, tools: e.target.value }))}
                placeholder="Tools definition JSON..."
                rows={12}
                className="font-mono text-xs bg-[#161b22] border-[#21262d] text-primary placeholder:text-[#484f58]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-primary hover:bg-primary/80 text-black">
            {submitting ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
