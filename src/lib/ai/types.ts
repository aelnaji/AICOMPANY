export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export interface ChatResult {
  completionText: string;
  rawResponse: unknown;
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: string; // zai, openai, nvidia_nim, openai_compatible, other
  baseUrl: string;
  apiKey: string;
  extraHeaders: Record<string, string>;
}
