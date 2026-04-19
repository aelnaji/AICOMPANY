import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/agents
export async function GET() {
  try {
    const agents = await db.agent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        provider: { select: { id: true, name: true, type: true } },
        model: { select: { id: true, name: true, displayName: true } },
        _count: { select: { tasks: true } },
      },
    });
    return NextResponse.json({ data: agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

// POST /api/v1/agents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, description, providerId, modelId, systemPrompt, temperature, topP, maxTokens, isActive } = body;

    if (!name || !providerId || !modelId) {
      return NextResponse.json({ error: "name, providerId, and modelId are required" }, { status: 400 });
    }

    const agent = await db.agent.create({
      data: {
        name,
        role: role || "CUSTOM",
        description: description || "",
        providerId,
        modelId,
        systemPrompt: systemPrompt || "",
        temperature: temperature ?? 0.7,
        topP: topP ?? 0.9,
        maxTokens: maxTokens ?? 2048,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}
