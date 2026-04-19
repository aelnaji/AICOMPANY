import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/agents/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        provider: true,
        model: true,
        tasks: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    return NextResponse.json({ data: agent });
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 });
  }
}

// PUT /api/v1/agents/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, role, description, providerId, modelId, systemPrompt, temperature, topP, maxTokens, isActive } = body;

    const agent = await db.agent.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(description !== undefined && { description }),
        ...(providerId !== undefined && { providerId }),
        ...(modelId !== undefined && { modelId }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(temperature !== undefined && { temperature }),
        ...(topP !== undefined && { topP }),
        ...(maxTokens !== undefined && { maxTokens }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ data: agent });
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

// DELETE /api/v1/agents/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.agent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
  }
}
