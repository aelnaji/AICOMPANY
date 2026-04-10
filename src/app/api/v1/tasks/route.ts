import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const agentId = searchParams.get("agentId");

    const tasks = await db.task.findMany({
      where: {
        ...(status && status !== "all" ? { status } : {}),
        ...(agentId ? { assignedAgentId: agentId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        assignedAgent: {
          select: { id: true, name: true, role: true },
        },
      },
    });
    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/v1/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, assignedAgentId } = body;

    if (!title || !assignedAgentId) {
      return NextResponse.json({ error: "title and assignedAgentId are required" }, { status: 400 });
    }

    // Verify agent exists
    const agent = await db.agent.findUnique({ where: { id: assignedAgentId } });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const task = await db.task.create({
      data: {
        title,
        description: description || "",
        assignedAgentId,
        status: "todo",
      },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
