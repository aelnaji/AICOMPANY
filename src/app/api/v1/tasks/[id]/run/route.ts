import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { executeAgentChat } from "@/lib/ai/provider-factory";
import type { ProviderConfig } from "@/lib/ai/types";

// POST /api/v1/tasks/:id/run
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get task with full agent details
    const task = await db.task.findUnique({
      where: { id },
      include: {
        assignedAgent: {
          include: {
            provider: true,
            model: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const agent = task.assignedAgent;

    if (!agent.isActive) {
      return NextResponse.json({ error: "Agent is not active" }, { status: 400 });
    }

    // Update task status to in_progress
    await db.task.update({
      where: { id },
      data: { status: "in_progress" },
    });

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

    // Build messages
    const messages = [
      { role: "system" as const, content: agent.systemPrompt },
      { role: "user" as const, content: `${task.title}\n\n${task.description}` },
    ];

    try {
      // Execute the AI call
      const result = await executeAgentChat(
        providerConfig,
        agent.systemPrompt,
        `${task.title}\n\n${task.description}`,
        {
          temperature: agent.temperature,
          topP: agent.topP,
          maxTokens: agent.maxTokens,
          model: agent.model.name,
        }
      );

      // Extract a brief summary (first 200 chars of response)
      const summary = result.completionText.slice(0, 200) + (result.completionText.length > 200 ? "..." : "");

      // Update task with results
      const updatedTask = await db.task.update({
        where: { id },
        data: {
          status: "completed",
          resultSummary: summary,
          responseText: result.completionText,
          rawResponse: JSON.stringify(result.rawResponse),
          messages: JSON.stringify(messages),
        },
        include: {
          assignedAgent: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return NextResponse.json({ data: updatedTask });
    } catch (aiError) {
      // Update task as failed
      const errorMsg = aiError instanceof Error ? aiError.message : "Unknown error";

      const updatedTask = await db.task.update({
        where: { id },
        data: {
          status: "failed",
          resultSummary: `Error: ${errorMsg}`,
          messages: JSON.stringify(messages),
        },
        include: {
          assignedAgent: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return NextResponse.json({ data: updatedTask });
    }
  } catch (error) {
    console.error("Error running task:", error);
    return NextResponse.json({ error: "Failed to run task" }, { status: 500 });
  }
}
