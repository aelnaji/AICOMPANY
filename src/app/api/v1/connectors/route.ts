import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/connectors
export async function GET() {
  try {
    const connectors = await db.connector.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: connectors });
  } catch (error) {
    console.error("Error fetching connectors:", error);
    return NextResponse.json({ error: "Failed to fetch connectors" }, { status: 500 });
  }
}

// POST /api/v1/connectors
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, category, config, isActive, isConnected } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const connector = await db.connector.create({
      data: {
        name,
        type,
        category: category || "other",
        config: config ? JSON.stringify(config) : "{}",
        isActive: isActive ?? false,
        isConnected: isConnected ?? false,
      },
    });

    return NextResponse.json({ data: connector }, { status: 201 });
  } catch (error) {
    console.error("Error creating connector:", error);
    return NextResponse.json({ error: "Failed to create connector" }, { status: 500 });
  }
}
