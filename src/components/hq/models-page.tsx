"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Cpu, Star } from "lucide-react";
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
  contextWindow: number;
  isDefault: boolean;
  providerId: string;
  provider: Provider;
  _count: { agents: number };
}

interface ModelFormData {
  providerId: string;
  name: string;
  displayName: string;
  contextWindow: number;
  isDefault: boolean;
}

const defaultForm: ModelFormData = {
  providerId: "",
  name: "",
  displayName: "",
  contextWindow: 4096,
  isDefault: false,
};

export function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState<ModelFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterProvider, setFilterProvider] = useState<string>("all");

  const fetchData = useCallback(async () => {
    const [modelsRes, providersRes] = await Promise.all([
      fetch("/api/v1/models"),
      fetch("/api/v1/providers"),
    ]);
    const modelsData = await modelsRes.json();
    const providersData = await providersRes.json();
    setModels(modelsData.data || []);
    setProviders(providersData.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredModels = filterProvider === "all"
    ? models
    : models.filter((m) => m.providerId === filterProvider);

  const openCreateDialog = () => {
    setEditingModel(null);
    setFormData(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = (model: Model) => {
    setEditingModel(model);
    setFormData({
      providerId: model.providerId,
      name: model.name,
      displayName: model.displayName,
      contextWindow: model.contextWindow,
      isDefault: model.isDefault,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.providerId || !formData.name) {
      toast.error("Provider and model name are required");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingModel ? `/api/v1/models/${editingModel.id}` : "/api/v1/models";
      const method = editingModel ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save model");
      }
      toast.success(editingModel ? "Model updated" : "Model created");
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save model");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/models/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      toast.success("Model deleted");
      fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete model");
    }
  };

  const handleToggleDefault = async (model: Model) => {
    try {
      const res = await fetch(`/api/v1/models/${model.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: !model.isDefault }),
      });
      if (!res.ok) throw new Error("Failed to update default");
      toast.success(model.isDefault ? "Removed as default" : "Set as default");
      fetchData();
    } catch {
      toast.error("Failed to update default status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">Manage AI models</p>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">Manage available AI models per provider</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Model
        </Button>
      </div>

      {/* Provider Filter */}
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Filter by provider:</Label>
        <Select value={filterProvider} onValueChange={setFilterProvider}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Context Window</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No models found. Click &quot;Add Model&quot; to register a model.
                  </TableCell>
                </TableRow>
              ) : (
                filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{model.displayName || model.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{model.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{model.provider.name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(model.contextWindow / 1000).toFixed(0)}K
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleDefault(model)}
                        className="gap-1"
                      >
                        <Star className={`h-3.5 w-3.5 ${model.isDefault ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                        {model.isDefault ? "Yes" : "Set"}
                      </Button>
                    </TableCell>
                    <TableCell>{model._count.agents}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(model)}>
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
                              <AlertDialogTitle>Delete Model</AlertDialogTitle>
                              <AlertDialogDescription>
                                {model._count.agents > 0
                                  ? `Cannot delete "${model.displayName || model.name}" — ${model._count.agents} agent(s) are using it.`
                                  : `Are you sure you want to delete "${model.displayName || model.name}"?`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(model.id)}
                                disabled={model._count.agents > 0}
                                className="bg-destructive text-destructive-foreground"
                              >
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingModel ? "Edit Model" : "Add Model"}</DialogTitle>
            <DialogDescription>
              {editingModel ? "Update model configuration" : "Register a new AI model"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Provider *</Label>
              <Select value={formData.providerId} onValueChange={(v) => setFormData((prev) => ({ ...prev, providerId: v }))}>
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
              <Label htmlFor="model-name">Model ID *</Label>
              <Input
                id="model-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., gpt-4o, nvidia/llama-3.1-nemotron-70b-instruct"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">The exact model identifier used by the provider API</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., GPT-4o, Nemotron 70B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contextWindow">Context Window (tokens)</Label>
              <Input
                id="contextWindow"
                type="number"
                min="1"
                max="2000000"
                value={formData.contextWindow}
                onChange={(e) => setFormData((prev) => ({ ...prev, contextWindow: parseInt(e.target.value) || 4096 }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(v) => setFormData((prev) => ({ ...prev, isDefault: v }))}
              />
              <Label>Set as default model for this provider</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingModel ? "Update" : "Add Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
