import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/providers/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = await db.provider.findUnique({
      where: { id },
      include: {
        models: true,
        _count: { select: { agents: true } },
      },
    });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    // Don't mask here — the edit form needs the real key
    return NextResponse.json({ data: provider });
  } catch (error) {
    console.error("Error fetching provider:", error);
    return NextResponse.json({ error: "Failed to fetch provider" }, { status: 500 });
  }
}

// PUT /api/v1/providers/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, baseUrl, apiKey, extraHeaders } = body;

    const provider = await db.provider.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(baseUrl !== undefined && { baseUrl }),
        ...(apiKey !== undefined && { apiKey }),
        ...(extraHeaders !== undefined && { extraHeaders: JSON.stringify(extraHeaders) }),
      },
    });

    return NextResponse.json({ data: provider });
  } catch (error) {
    console.error("Error updating provider:", error);
    return NextResponse.json({ error: "Failed to update provider" }, { status: 500 });
  }
}

// DELETE /api/v1/providers/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if provider has agents
    const agentCount = await db.agent.count({ where: { providerId: id } });
    if (agentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete provider: ${agentCount} agent(s) are using it` },
        { status: 400 }
      );
    }
    await db.provider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting provider:", error);
    return NextResponse.json({ error: "Failed to delete provider" }, { status: 500 });
  }
}
