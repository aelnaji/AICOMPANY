"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Globe, ListTodo, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  agentCount: number;
  providerCount: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeTasks: number;
  todoTasks: number;
  successRate: number;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    assignedAgent: { id: string; name: string; role: string };
  }>;
  tasksOverTime: Array<{ createdAt: string; _count: { id: number } }>;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  failed: "bg-red-500/10 text-red-600 border-red-500/30",
  in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  todo: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">AI Headquarters overview</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Completed", value: stats.completedTasks },
    { name: "In Progress", value: stats.activeTasks },
    { name: "To Do", value: stats.todoTasks },
    { name: "Failed", value: stats.failedTasks },
  ].filter((d) => d.value > 0);

  const PIE_COLORS = ["#10b981", "#f59e0b", "#94a3b8", "#ef4444"];

  // Aggregate tasks over time by date
  const chartData = stats.tasksOverTime.reduce<Record<string, number>>((acc, item) => {
    const date = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    acc[date] = (acc[date] || 0) + item._count.id;
    return acc;
  }, {});
  const barChartData = Object.entries(chartData).map(([date, count]) => ({ date, count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">AI Headquarters command center overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agentCount}</div>
            <p className="text-xs text-muted-foreground">AI agents configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.providerCount}</div>
            <p className="text-xs text-muted-foreground">Model providers connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todoTasks} queued · {stats.totalTasks} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} completed · {stats.failedTasks} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Status Distribution</CardTitle>
            <CardDescription>Breakdown of all tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{entry.name}</span>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                No tasks yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks Over Time</CardTitle>
            <CardDescription>Task creation trend (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {barChartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Tasks</CardTitle>
          <CardDescription>Latest task activity across all agents</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentTasks.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : task.status === "failed" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{task.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      → {task.assignedAgent.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={STATUS_COLORS[task.status] || ""}>
                      {task.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              No tasks created yet. Create your first task from the Tasks page.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
