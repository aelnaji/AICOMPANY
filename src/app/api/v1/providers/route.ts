import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/providers
export async function GET() {
  try {
    const providers = await db.provider.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { models: true, agents: true } },
      },
    });
    // Mask API keys for response
    const masked = providers.map((p) => ({
      ...p,
      apiKey: p.apiKey ? "••••••••" + p.apiKey.slice(-4) : "",
    }));
    return NextResponse.json({ data: masked });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

// POST /api/v1/providers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, baseUrl, apiKey, extraHeaders } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const provider = await db.provider.create({
      data: {
        name,
        type: type || "openai_compatible",
        baseUrl: baseUrl || "",
        apiKey: apiKey || "",
        extraHeaders: extraHeaders ? JSON.stringify(extraHeaders) : "{}",
      },
    });

    return NextResponse.json({ data: provider }, { status: 201 });
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 });
  }
}
