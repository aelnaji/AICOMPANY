import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/models/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const model = await db.model.findUnique({
      where: { id },
      include: { provider: true },
    });
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    return NextResponse.json({ data: model });
  } catch (error) {
    console.error("Error fetching model:", error);
    return NextResponse.json({ error: "Failed to fetch model" }, { status: 500 });
  }
}

// PUT /api/v1/models/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, displayName, contextWindow, pricingInfo, isDefault } = body;

    // If marking as default, unset other defaults for same provider
    if (isDefault) {
      const model = await db.model.findUnique({ where: { id } });
      if (model) {
        await db.model.updateMany({
          where: { providerId: model.providerId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
    }

    const updated = await db.model.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(displayName !== undefined && { displayName }),
        ...(contextWindow !== undefined && { contextWindow }),
        ...(pricingInfo !== undefined && { pricingInfo: JSON.stringify(pricingInfo) }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating model:", error);
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 });
  }
}

// DELETE /api/v1/models/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentCount = await db.agent.count({ where: { modelId: id } });
    if (agentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete model: ${agentCount} agent(s) are using it` },
        { status: 400 }
      );
    }
    await db.model.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting model:", error);
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 });
  }
}
