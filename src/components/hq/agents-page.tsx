"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Bot, Power } from "lucide-react";
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
  type: string;
}

interface Model {
  id: string;
  name: string;
  displayName: string;
  providerId: string;
  provider: Provider;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  isActive: boolean;
  providerId: string;
  modelId: string;
  provider: Provider;
  model: { id: string; name: string; displayName: string };
  _count: { tasks: number };
}

const ROLES = ["CEO", "CTO", "BACKEND", "FRONTEND", "QA", "DEVOPS", "CISO", "WRITER", "CUSTOM"];

const ROLE_COLORS: Record<string, string> = {
  CEO: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  CTO: "bg-violet-500/10 text-violet-700 border-violet-500/30",
  BACKEND: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  FRONTEND: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30",
  QA: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  DEVOPS: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  CISO: "bg-red-500/10 text-red-700 border-red-500/30",
  WRITER: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30",
  CUSTOM: "bg-slate-500/10 text-slate-700 border-slate-500/30",
};

interface AgentFormData {
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
}

const defaultFormData: AgentFormData = {
  name: "",
  role: "CUSTOM",
  description: "",
  providerId: "",
  modelId: "",
  systemPrompt: "",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  isActive: true,
};

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    const [agentsRes, providersRes, modelsRes] = await Promise.all([
      fetch("/api/v1/agents"),
      fetch("/api/v1/providers"),
      fetch("/api/v1/models"),
    ]);
    const agentsData = await agentsRes.json();
    const providersData = await providersRes.json();
    const modelsData = await modelsRes.json();
    setAgents(agentsData.data || []);
    setProviders(providersData.data || []);
    setModels(modelsData.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredModels = models.filter((m) => m.providerId === formData.providerId);

  const openCreateDialog = () => {
    setEditingAgent(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent);
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
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.providerId || !formData.modelId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingAgent ? `/api/v1/agents/${editingAgent.id}` : "/api/v1/agents";
      const method = editingAgent ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save agent");
      toast.success(editingAgent ? "Agent updated" : "Agent created");
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save agent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/agents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete agent");
      toast.success("Agent deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete agent");
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      const res = await fetch(`/api/v1/agents/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !agent.isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle agent");
      toast.success(agent.isActive ? "Agent deactivated" : "Agent activated");
      fetchData();
    } catch {
      toast.error("Failed to toggle agent");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage your AI workforce</p>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage your AI workforce</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No agents yet. Click &quot;Add Agent&quot; to create your first AI agent.
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ROLE_COLORS[agent.role] || ROLE_COLORS.CUSTOM}>
                        {agent.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{agent.provider.name}</TableCell>
                    <TableCell className="text-muted-foreground">{agent.model.displayName || agent.model.name}</TableCell>
                    <TableCell>{agent._count.tasks}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={agent.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-slate-500/10 text-slate-600 border-slate-500/30"}>
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(agent)} title={agent.isActive ? "Deactivate" : "Activate"}>
                          <Power className={`h-4 w-4 ${agent.isActive ? "text-emerald-500" : "text-muted-foreground"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(agent)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{agent.name}&quot;? This will also delete all tasks assigned to this agent.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(agent.id)} className="bg-destructive text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAgent ? "Edit Agent" : "Create Agent"}</DialogTitle>
            <DialogDescription>
              {editingAgent ? "Update agent configuration" : "Add a new AI agent to your workforce"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="AGENT-CUSTOM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData((prev) => ({ ...prev, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this agent's responsibilities"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider *</Label>
                <Select value={formData.providerId} onValueChange={(v) => setFormData((prev) => ({ ...prev, providerId: v, modelId: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model *</Label>
                <Select value={formData.modelId} onValueChange={(v) => setFormData((prev) => ({ ...prev, modelId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.providerId ? "Select model" : "Select provider first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.displayName || m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Temperature: {formData.temperature}</Label>
                <Input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label>Top P: {formData.topP}</Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.topP}
                  onChange={(e) => setFormData((prev) => ({ ...prev, topP: parseFloat(e.target.value) }))}
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  max="128000"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || 2048 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="Define how this agent should behave..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData((prev) => ({ ...prev, isActive: v }))}
              />
              <Label>Agent is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingAgent ? "Update Agent" : "Create Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
