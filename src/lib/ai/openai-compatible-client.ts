import { ChatOptions, ChatResult, ProviderConfig } from "./types";

export class OpenAICompatibleClient {
  private baseUrl: string;
  private apiKey: string;
  private extraHeaders: Record<string, string>;

  constructor(config: ProviderConfig) {
    // Strip trailing slash from baseUrl
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.extraHeaders = config.extraHeaders || {};
  }

  async chat(options: ChatOptions): Promise<ChatResult> {
    const url = `${this.baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      ...this.extraHeaders,
    };

    const body = {
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 0.9,
      max_tokens: options.maxTokens ?? 2048,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Provider API error (${response.status}): ${errorText}`);
    }

    const rawResponse = await response.json();

    // Standard OpenAI-compatible response format
    const completionText = rawResponse.choices?.[0]?.message?.content || "";

    return {
      completionText,
      rawResponse,
    };
  }
}
