"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Key, Cpu, Shield, Info, Zap } from "lucide-react";

interface ProviderSummary {
  id: string;
  name: string;
  type: string;
  hasApiKey: boolean;
  baseUrl: string;
  _count: { models: number; agents: number };
}

export function SettingsPage() {
  const [providers, setProviders] = useState<ProviderSummary[]>([]);

  useEffect(() => {
    fetch("/api/v1/providers")
      .then((res) => res.json())
      .then((data) => {
        setProviders(
          (data.data || []).map((p: { apiKey: string; [key: string]: unknown }) => ({
            ...p,
            hasApiKey: !!p.apiKey && p.apiKey !== "" && !p.apiKey.startsWith("••••"),
          }))
        );
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">System configuration and provider setup guide</p>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform</span>
            <span className="font-medium">AI Headquarters v1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Environment</span>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
              Development
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stack</span>
            <span className="font-medium">Next.js 16 + Prisma + SQLite</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provider Protocol</span>
            <span className="font-medium">OpenAI Compatible</span>
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Provider Configuration Status
          </CardTitle>
          <CardDescription>
            Review which providers are configured with API keys and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No providers configured yet.</p>
          ) : (
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{provider.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{provider.baseUrl || "No base URL"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {provider._count.models} models · {provider._count.agents} agents
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        provider.hasApiKey
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      }
                    >
                      {provider.hasApiKey ? "API Key Set" : "No API Key"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4" />
            Provider Setup Guide
          </CardTitle>
          <CardDescription>How to configure each provider type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {/* Z.AI */}
          <div>
            <h4 className="font-semibold mb-1">Z.AI (GLM Models)</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Base URL: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">https://open.bigmodel.cn/api/paas/v4</code></li>
              <li>• Models: glm-4-plus, glm-4, glm-4-flash</li>
              <li>• Get API key from <span className="text-foreground">open.bigmodel.cn</span></li>
            </ul>
          </div>
          <Separator />
          {/* OpenAI */}
          <div>
            <h4 className="font-semibold mb-1">OpenAI</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Base URL: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">https://api.openai.com/v1</code></li>
              <li>• Models: gpt-4o, gpt-4o-mini, o3-mini</li>
              <li>• Get API key from <span className="text-foreground">platform.openai.com</span></li>
            </ul>
          </div>
          <Separator />
          {/* NVIDIA NIM */}
          <div>
            <h4 className="font-semibold mb-1">NVIDIA NIM</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Base URL: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">https://integrate.api.nvidia.com/v1</code></li>
              <li>• Models: nvidia/llama-3.1-nemotron-70b-instruct, mistralai/mixtral-8x22b-instruct-v0.1</li>
              <li>• Get API key from <span className="text-foreground">build.nvidia.com</span></li>
            </ul>
          </div>
          <Separator />
          {/* OpenAI Compatible */}
          <div>
            <h4 className="font-semibold mb-1">OpenAI Compatible (Any Provider)</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Set base URL to the provider&apos;s API endpoint (must support /chat/completions)</li>
              <li>• Enter the API key provided by the service</li>
              <li>• Type the exact model identifier used by that provider</li>
              <li>• Works with: Together AI, Groq, Mistral API, Anthropic (via proxy), LM Studio, Ollama, etc.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Security Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• API keys are stored in a local SQLite database (development mode).</p>
          <p>• Keys are never logged or exposed in API list responses (masked with ••••••••).</p>
          <p>• For production, use environment variables or a secrets manager.</p>
          <p>• All AI requests are made server-side via API routes — keys are never sent to the browser.</p>
        </CardContent>
      </Card>
    </div>
  );
}
