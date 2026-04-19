import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { executeAgentChat } from "@/lib/ai/provider-factory";
import type { ProviderConfig } from "@/lib/ai/types";

// POST /api/v1/agents/:id/chat — Direct chat with an agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get agent with full details
    const agent = await db.agent.findUnique({
      where: { id },
      include: { provider: true, model: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agent.isActive) {
      return NextResponse.json({ error: "Agent is not active" }, { status: 400 });
    }

    // Build provider config
    let extraHeaders: Record<string, string> = {};
    try {
      extraHeaders = agent.provider.extraHeaders
        ? JSON.parse(agent.provider.extraHeaders)
        : {};
    } catch {
      extraHeaders = {};
    }

    const providerConfig: ProviderConfig = {
      id: agent.provider.id,
      name: agent.provider.name,
      type: agent.provider.type,
      baseUrl: agent.provider.baseUrl,
      apiKey: agent.provider.apiKey,
      extraHeaders,
    };

    // Check if API key is configured
    if (!providerConfig.apiKey) {
      return NextResponse.json({
        data: {
          responseText: `**No API key configured** for ${agent.provider.name}.\n\nPlease go to the Providers page and add an API key for ${agent.provider.name} to enable this agent.\n\nBase URL: \`${providerConfig.baseUrl || "Not set"}\``,
          resultSummary: "No API key configured",
        },
      });
    }

    try {
      const result = await executeAgentChat(
        providerConfig,
        agent.systemPrompt,
        message,
        {
          temperature: agent.temperature,
          topP: agent.topP,
          maxTokens: agent.maxTokens,
          model: agent.model.name,
        }
      );

      const summary = result.completionText.slice(0, 200) + (result.completionText.length > 200 ? "..." : "");

      return NextResponse.json({
        data: {
          responseText: result.completionText,
          resultSummary: summary,
          rawResponse: result.rawResponse,
        },
      });
    } catch (aiError) {
      const errorMsg = aiError instanceof Error ? aiError.message : "Unknown error";
      return NextResponse.json({
        data: {
          responseText: `**Error calling ${agent.provider.name}:**\n\n\`${errorMsg}\`\n\nPlease check your API key and provider configuration.`,
          resultSummary: `Error: ${errorMsg}`,
        },
      });
    }
  } catch (error) {
    console.error("Error in agent chat:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
