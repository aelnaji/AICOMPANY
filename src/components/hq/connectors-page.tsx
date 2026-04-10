"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search, Settings, Unplug, Plug, Check } from "lucide-react";
import { toast } from "sonner";
import {
  connectorRegistry,
  CATEGORIES,
  CATEGORY_COLORS,
  getConnectorDef,
  type ConnectorDef,
} from "@/lib/connectors-registry";

interface SavedConnector {
  id: string;
  name: string;
  type: string;
  category: string;
  config: string;
  isActive: boolean;
  isConnected: boolean;
}

export function ConnectorsPage() {
  const [savedConnectors, setSavedConnectors] = useState<SavedConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<ConnectorDef | null>(null);
  const [editingConnector, setEditingConnector] = useState<SavedConnector | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchConnectors = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/connectors");
      const data = await res.json();
      setSavedConnectors(data.data || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  // Build a map of saved connectors by type for quick lookup
  const savedMap = new Map(savedConnectors.map((c) => [c.type, c]));

  // Filter connectors
  const filteredConnectors = connectorRegistry.filter((c) => {
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeCount = savedConnectors.filter((c) => c.isConnected).length;

  const openConfig = (def: ConnectorDef) => {
    setSelectedConnector(def);
    const saved = savedMap.get(def.key);
    if (saved) {
      setEditingConnector(saved);
      try {
        const config = JSON.parse(saved.config || "{}");
        setFormValues(config);
      } catch {
        setFormValues({});
      }
    } else {
      setEditingConnector(null);
      const defaults: Record<string, string> = {};
      def.fields.forEach((f) => { defaults[f.key] = ""; });
      if (def.key === "ollama") defaults.baseUrl = "http://localhost:11434";
      setFormValues(defaults);
    }
    setConfigDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedConnector) return;
    setSaving(true);
    try {
      const requiredFields = selectedConnector.fields.filter((f) => f.required);
      for (const field of requiredFields) {
        if (!formValues[field.key]?.trim()) {
          toast.error(`${field.label} is required`);
          setSaving(false);
          return;
        }
      }

      const body = {
        name: selectedConnector.name,
        type: selectedConnector.key,
        category: selectedConnector.category,
        config: formValues,
        isActive: true,
        isConnected: true,
      };

      if (editingConnector) {
        const res = await fetch(`/api/v1/connectors/${editingConnector.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        // Check if already exists
        const existing = savedMap.get(selectedConnector.key);
        if (existing) {
          const res = await fetch(`/api/v1/connectors/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error("Failed to update");
        } else {
          const res = await fetch("/api/v1/connectors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error("Failed to save");
        }
      }
      toast.success(`${selectedConnector.name} configured successfully`);
      setConfigDialogOpen(false);
      fetchConnectors();
    } catch {
      toast.error("Failed to save connector");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!editingConnector) return;
    try {
      await fetch(`/api/v1/connectors/${editingConnector.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false, isConnected: false }),
      });
      toast.success(`${selectedConnector?.name} disconnected`);
      setConfigDialogOpen(false);
      fetchConnectors();
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  const handleToggleActive = async (connector: SavedConnector) => {
    try {
      await fetch(`/api/v1/connectors/${connector.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !connector.isActive }),
      });
      fetchConnectors();
    } catch {
      toast.error("Failed to toggle connector");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-[#1e2430]" />
          <div className="h-10 w-full rounded bg-[#1e2430]" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-[#1e2430]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#e2e8f0]">Connectors & Sources</h1>
          {activeCount > 0 && (
            <Badge variant="outline" className="border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-xs">
              {activeCount} connected
            </Badge>
          )}
        </div>
        <p className="text-sm text-[#8b949e]">Connect external services to your AI agents</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484f58]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search connectors..."
          className="pl-10 bg-[#161b22] border-[#21262d] text-[#e2e8f0] placeholder:text-[#484f58]"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilterCategory(cat.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filterCategory === cat.key
                ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30"
                : "bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-[#e2e8f0] hover:border-[#30363d]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredConnectors.map((def) => {
          const saved = savedMap.get(def.key);
          const isConnected = saved?.isConnected ?? false;
          const isActive = saved?.isActive ?? false;

          return (
            <Card
              key={def.key}
              className={`bg-[#0d1117] border-[#21262d] hover:border-[#30363d] transition-all ${
                isConnected ? "border-l-2 border-l-[#22c55e]" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">{def.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#e2e8f0]">{def.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[def.category] || "text-[#8b949e] bg-[#1e2430] border-[#30363d]"}`}
                      >
                        {def.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#8b949e] mt-0.5">{def.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {saved && (
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggleActive(saved)}
                      />
                    )}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        isConnected
                          ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]"
                          : "border-[#30363d] bg-[#161b22] text-[#484f58]"
                      }`}
                    >
                      {isConnected ? (
                        <span className="flex items-center gap-1"><Check className="h-2.5 w-2.5" /> Connected</span>
                      ) : "Not Connected"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-[#8b949e] hover:text-[#e2e8f0]"
                    onClick={() => openConfig(def)}
                  >
                    {isConnected ? <Settings className="h-3 w-3" /> : <Plug className="h-3 w-3" />}
                    {isConnected ? "Configure" : "Connect"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredConnectors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-[#484f58]">
          <Search className="h-8 w-8 mb-3 opacity-30" />
          <p className="text-sm">No connectors found</p>
        </div>
      )}

      {/* Configure Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedConnector?.emoji}</span>
              {editingConnector ? `${selectedConnector?.name} Settings` : `Connect ${selectedConnector?.name}`}
            </DialogTitle>
            <DialogDescription>{selectedConnector?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedConnector?.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-[#ef4444] ml-1">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={formValues[field.key] || ""}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={4}
                    className="font-mono text-sm bg-[#161b22] border-[#21262d] text-[#e2e8f0] placeholder:text-[#484f58]"
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === "secret" ? "password" : field.type === "number" ? "number" : "text"}
                    value={formValues[field.key] || ""}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="font-mono text-sm bg-[#161b22] border-[#21262d] text-[#e2e8f0] placeholder:text-[#484f58]"
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            {editingConnector && (
              <Button
                variant="outline"
                className="border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10"
                onClick={handleDisconnect}
              >
                <Unplug className="h-3.5 w-3.5 mr-1" />
                Disconnect
              </Button>
            )}
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black"
            >
              {saving ? "Saving..." : isConnected ? "Update" : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
