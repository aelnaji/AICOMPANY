import { OpenAICompatibleClient } from "./openai-compatible-client";
import { ChatOptions, ChatResult, ProviderConfig } from "./types";

export function createProviderClient(config: ProviderConfig) {
  // All providers use the OpenAI-compatible client since they all follow the same API pattern
  // The type field is for categorization/display purposes in the UI
  return new OpenAICompatibleClient(config);
}

export async function executeAgentChat(
  config: ProviderConfig,
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; topP?: number; maxTokens?: number; model?: string }
): Promise<ChatResult> {
  const client = createProviderClient(config);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userMessage },
  ];

  return client.chat({
    model: options?.model || "",
    messages,
    temperature: options?.temperature,
    topP: options?.topP,
    maxTokens: options?.maxTokens,
  });
}
