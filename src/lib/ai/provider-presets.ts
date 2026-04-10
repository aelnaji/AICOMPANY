export interface ProviderPreset {
  type: string;
  name: string;
  baseUrl: string;
  defaultModels: { name: string; displayName: string; contextWindow: number }[];
}

export const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  zai: {
    type: "zai",
    name: "Z.AI",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    defaultModels: [
      { name: "glm-4-plus", displayName: "GLM-4 Plus", contextWindow: 128000 },
      { name: "glm-4", displayName: "GLM-4", contextWindow: 128000 },
      { name: "glm-4-flash", displayName: "GLM-4 Flash", contextWindow: 128000 },
    ],
  },
  openai: {
    type: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModels: [
      { name: "gpt-4o", displayName: "GPT-4o", contextWindow: 128000 },
      { name: "gpt-4o-mini", displayName: "GPT-4o Mini", contextWindow: 128000 },
      { name: "gpt-4.1", displayName: "GPT-4.1", contextWindow: 1047576 },
      { name: "o3-mini", displayName: "o3-mini", contextWindow: 200000 },
    ],
  },
  nvidia_nim: {
    type: "nvidia_nim",
    name: "NVIDIA NIM",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    defaultModels: [
      { name: "nvidia/llama-3.1-nemotron-70b-instruct", displayName: "Llama 3.1 Nemotron 70B", contextWindow: 131072 },
      { name: "mistralai/mixtral-8x22b-instruct-v0.1", displayName: "Mixtral 8x22B", contextWindow: 65536 },
    ],
  },
  openai_compatible: {
    type: "openai_compatible",
    name: "OpenAI Compatible",
    baseUrl: "",
    defaultModels: [],
  },
};

export function getPresetByType(type: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS[type];
}

export function getBaseUrlForType(type: string): string {
  return PROVIDER_PRESETS[type]?.baseUrl || "";
}
