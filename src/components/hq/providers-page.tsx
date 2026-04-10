"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";
import { getBaseUrlForType } from "@/lib/ai/provider-presets";

interface Provider {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string;
  extraHeaders: string;
  _count: { models: number; agents: number };
}

interface ProviderFull {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string;
  extraHeaders: string;
  models: Array<{ id: string; name: string; displayName: string }>;
  _count: { models: number; agents: number };
}

const PROVIDER_TYPES = [
  { value: "zai", label: "Z.AI" },
  { value: "openai", label: "OpenAI" },
  { value: "nvidia_nim", label: "NVIDIA NIM" },
  { value: "openai_compatible", label: "OpenAI Compatible" },
  { value: "other", label: "Other / Custom" },
];

const TYPE_COLORS: Record<string, string> = {
  zai: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  openai: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  nvidia_nim: "bg-green-500/10 text-green-700 border-green-500/30",
  openai_compatible: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30",
  other: "bg-slate-500/10 text-slate-700 border-slate-500/30",
};

interface ProviderFormData {
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string;
  extraHeaders: string;
}

const defaultForm: ProviderFormData = {
  name: "",
  type: "openai_compatible",
  baseUrl: "",
  apiKey: "",
  extraHeaders: "{}",
};

export function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderFull | null>(null);
  const [formData, setFormData] = useState<ProviderFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchProviders = useCallback(async () => {
    const res = await fetch("/api/v1/providers");
    const data = await res.json();
    setProviders(data.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleTypeChange = (type: string) => {
    const baseUrl = getBaseUrlForType(type);
    const typeInfo = PROVIDER_TYPES.find((t) => t.value === type);
    setFormData((prev) => ({
      ...prev,
      type,
      baseUrl: baseUrl || prev.baseUrl,
      name: prev.name || (typeInfo?.label ? `${typeInfo.label} Provider` : ""),
    }));
  };

  const openCreateDialog = () => {
    setEditingProvider(null);
    setFormData(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = async (provider: Provider) => {
    try {
      const res = await fetch(`/api/v1/providers/${provider.id}`);
      const data = await res.json();
      setEditingProvider(data.data);
      setFormData({
        name: data.data.name,
        type: data.data.type,
        baseUrl: data.data.baseUrl,
        apiKey: data.data.apiKey,
        extraHeaders: data.data.extraHeaders,
      });
      setDialogOpen(true);
    } catch {
      toast.error("Failed to load provider details");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast.error("Name and type are required");
      return;
    }
    setSubmitting(true);
    try {
      let extraHeadersObj: Record<string, string> = {};
      try {
        extraHeadersObj = formData.extraHeaders ? JSON.parse(formData.extraHeaders) : {};
      } catch {
        toast.error("Extra headers must be valid JSON");
        setSubmitting(false);
        return;
      }

      const url = editingProvider ? `/api/v1/providers/${editingProvider.id}` : "/api/v1/providers";
      const method = editingProvider ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          extraHeaders: extraHeadersObj,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save provider");
      }
      toast.success(editingProvider ? "Provider updated" : "Provider created");
      setDialogOpen(false);
      fetchProviders();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save provider");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/providers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      toast.success("Provider deleted");
      fetchProviders();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete provider");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Model Providers</h1>
          <p className="text-muted-foreground">Configure AI model providers</p>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Model Providers</h1>
          <p className="text-muted-foreground">Configure AI model providers and API endpoints</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Base URL</TableHead>
                <TableHead>Models</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No providers configured. Click &quot;Add Provider&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={TYPE_COLORS[provider.type] || TYPE_COLORS.other}>
                        {provider.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs font-mono">
                      {provider.baseUrl || "Not configured"}
                    </TableCell>
                    <TableCell>{provider._count.models}</TableCell>
                    <TableCell>{provider._count.agents}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(provider)}>
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
                              <AlertDialogTitle>Delete Provider</AlertDialogTitle>
                              <AlertDialogDescription>
                                {provider._count.agents > 0
                                  ? `Cannot delete "${provider.name}" — ${provider._count.agents} agent(s) are using it. Remove those agents first.`
                                  : `Are you sure you want to delete "${provider.name}" and all its models?`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(provider.id)}
                                disabled={provider._count.agents > 0}
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
            <DialogTitle>{editingProvider ? "Edit Provider" : "Add Provider"}</DialogTitle>
            <DialogDescription>
              {editingProvider ? "Update provider configuration" : "Configure a new AI model provider"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Name *</Label>
              <Input
                id="provider-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., My Custom Provider"
              />
            </div>

            <div className="space-y-2">
              <Label>Provider Type *</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.example.com/v1"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Auto-filled for known providers. Edit as needed for custom endpoints.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Stored securely. Never logged or exposed in API responses.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extraHeaders">Extra Headers (JSON)</Label>
              <Textarea
                id="extraHeaders"
                value={formData.extraHeaders}
                onChange={(e) => setFormData((prev) => ({ ...prev, extraHeaders: e.target.value }))}
                placeholder='{"X-Custom-Header": "value"}'
                rows={3}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingProvider ? "Update" : "Add Provider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
