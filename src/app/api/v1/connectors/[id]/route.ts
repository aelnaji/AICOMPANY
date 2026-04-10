import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/connectors/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connector = await db.connector.findUnique({ where: { id } });
    if (!connector) {
      return NextResponse.json({ error: "Connector not found" }, { status: 404 });
    }
    return NextResponse.json({ data: connector });
  } catch (error) {
    console.error("Error fetching connector:", error);
    return NextResponse.json({ error: "Failed to fetch connector" }, { status: 500 });
  }
}

// PUT /api/v1/connectors/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, category, config, isActive, isConnected } = body;

    const connector = await db.connector.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(config !== undefined && { config: JSON.stringify(config) }),
        ...(isActive !== undefined && { isActive }),
        ...(isConnected !== undefined && { isConnected }),
      },
    });

    return NextResponse.json({ data: connector });
  } catch (error) {
    console.error("Error updating connector:", error);
    return NextResponse.json({ error: "Failed to update connector" }, { status: 500 });
  }
}

// DELETE /api/v1/connectors/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.connector.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting connector:", error);
    return NextResponse.json({ error: "Failed to delete connector" }, { status: 500 });
  }
}
