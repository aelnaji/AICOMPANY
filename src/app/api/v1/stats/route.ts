import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/stats
export async function GET() {
  try {
    const [agentCount, providerCount, taskStats] = await Promise.all([
      db.agent.count(),
      db.provider.count(),
      db.task.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const stat of taskStats) {
      statusCounts[stat.status] = stat._count.status;
    }

    const totalTasks = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const completedTasks = statusCounts["completed"] || 0;
    const failedTasks = statusCounts["failed"] || 0;
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Recent tasks
    const recentTasks = await db.task.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        assignedAgent: { select: { id: true, name: true, role: true } },
      },
    });

    // Tasks over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasksOverTime = await db.task.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      data: {
        agentCount,
        providerCount,
        totalTasks,
        completedTasks,
        failedTasks,
        activeTasks: statusCounts["in_progress"] || 0,
        todoTasks: statusCounts["todo"] || 0,
        successRate,
        recentTasks,
        tasksOverTime,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
