import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/models
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");

    const models = await db.model.findMany({
      where: providerId ? { providerId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        provider: { select: { id: true, name: true, type: true } },
        _count: { select: { agents: true } },
      },
    });
    return NextResponse.json({ data: models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}

// POST /api/v1/models
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, name, displayName, contextWindow, pricingInfo, isDefault } = body;

    if (!providerId || !name) {
      return NextResponse.json({ error: "providerId and name are required" }, { status: 400 });
    }

    // Verify provider exists
    const provider = await db.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // If marking as default, unset other defaults for this provider
    if (isDefault) {
      await db.model.updateMany({
        where: { providerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const model = await db.model.create({
      data: {
        providerId,
        name,
        displayName: displayName || name,
        contextWindow: contextWindow || 4096,
        pricingInfo: pricingInfo ? JSON.stringify(pricingInfo) : "{}",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ data: model }, { status: 201 });
  } catch (error) {
    console.error("Error creating model:", error);
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 });
  }
}
