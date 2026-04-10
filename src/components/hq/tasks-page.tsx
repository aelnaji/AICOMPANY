"use client";

import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Play,
  RotateCcw,
  Copy,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ListTodo,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface AgentSummary {
  id: string;
  name: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  resultSummary: string;
  responseText: string;
  rawResponse: string;
  messages: string;
  createdAt: string;
  updatedAt: string;
  assignedAgent: AgentSummary;
}

interface TaskFormData {
  title: string;
  description: string;
  assignedAgentId: string;
}

const STATUS_STYLES: Record<string, { icon: React.ReactNode; badgeClass: string }> = {
  completed: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  },
  failed: {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/30",
  },
  in_progress: {
    icon: <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />,
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  },
  todo: {
    icon: <ListTodo className="h-4 w-4 text-muted-foreground" />,
    badgeClass: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  },
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({ title: "", description: "", assignedAgentId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAgent, setFilterAgent] = useState<string>("all");

  const fetchData = useCallback(async () => {
    const [tasksRes, agentsRes] = await Promise.all([
      fetch("/api/v1/tasks"),
      fetch("/api/v1/agents"),
    ]);
    const tasksData = await tasksRes.json();
    const agentsData = await agentsRes.json();
    setTasks(tasksData.data || []);
    setAgents(agentsData.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll running tasks
  useEffect(() => {
    if (!runningTaskId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/tasks/${runningTaskId}`);
        const data = await res.json();
        if (data.data && data.data.status !== "in_progress") {
          setRunningTaskId(null);
          fetchData();
        }
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [runningTaskId, fetchData]);

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterAgent !== "all" && t.assignedAgentId !== filterAgent) return false;
    return true;
  });

  const activeAgents = agents.filter((a) => true); // show all agents for selection

  const handleCreate = async () => {
    if (!formData.title || !formData.assignedAgentId) {
      toast.error("Title and agent are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create task");
      toast.success("Task created");
      setCreateDialogOpen(false);
      setFormData({ title: "", description: "", assignedAgentId: "" });
      fetchData();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRun = async (taskId: string) => {
    setRunningTaskId(taskId);
    toast.info("Running task...");
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/run`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to run task");
      }
      const data = await res.json();
      if (data.data.status === "completed") {
        toast.success("Task completed successfully!");
        setExpandedTaskId(taskId);
      } else if (data.data.status === "failed") {
        toast.error("Task failed — check details");
      }
      fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to run task");
      setRunningTaskId(null);
    }
  };

  const handleDuplicate = async (task: Task) => {
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${task.title} (Copy)`,
          description: task.description,
          assignedAgentId: task.assignedAgentId,
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      toast.success("Task duplicated");
      fetchData();
    } catch {
      toast.error("Failed to duplicate task");
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await fetch(`/api/v1/tasks/${taskId}`, { method: "DELETE" });
      toast.success("Task deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and execute AI tasks</p>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Create, assign, and execute AI tasks</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {activeAgents.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filteredTasks.length} task(s)</span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              No tasks found. Create your first task to get started.
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.todo;
            const isExpanded = expandedTaskId === task.id;
            const isRunning = runningTaskId === task.id;
            const isRawJsonVisible = showRawJson === task.id;

            let messagesParsed: Array<{ role: string; content: string }> = [];
            try {
              messagesParsed = JSON.parse(task.messages);
            } catch {
              // ignore
            }

            let rawParsed: unknown = null;
            try {
              rawParsed = JSON.parse(task.rawResponse);
            } catch {
              // ignore
            }

            return (
              <Collapsible
                key={task.id}
                open={isExpanded}
                onOpenChange={(open) => setExpandedTaskId(open ? task.id : null)}
              >
                <Card className="overflow-hidden">
                  {/* Task Header Row */}
                  <div className="flex items-center gap-3 p-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {statusStyle.icon}
                        <span className="font-medium truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>→ {task.assignedAgent.name}</span>
                        <span>·</span>
                        <span>{new Date(task.createdAt).toLocaleString()}</span>
                        {task.resultSummary && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[300px]">{task.resultSummary}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className={statusStyle.badgeClass}>
                        {task.status.replace("_", " ")}
                      </Badge>
                      {(task.status === "todo" || task.status === "failed") && !isRunning && (
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRun(task.id);
                          }}
                        >
                          <Play className="h-3.5 w-3.5" />
                          Run
                        </Button>
                      )}
                      {isRunning && (
                        <Button size="sm" variant="outline" disabled className="gap-1">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Running...
                        </Button>
                      )}
                      {!isRunning && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRun(task.id);
                            }}
                            title="Re-run"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(task);
                            }}
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(task.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <CollapsibleContent>
                    <div className="border-t border-border">
                      {/* Messages Sent */}
                      {messagesParsed.length > 0 && (
                        <div className="p-4 space-y-3">
                          <h4 className="text-sm font-semibold">Messages Sent to Model</h4>
                          {messagesParsed.map((msg, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-border p-3"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className={
                                    msg.role === "system"
                                      ? "bg-violet-500/10 text-violet-600 border-violet-500/30"
                                      : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                  }
                                >
                                  {msg.role}
                                </Badge>
                              </div>
                              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                {msg.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI Response */}
                      {task.responseText && (
                        <>
                          <Separator />
                          <div className="p-4">
                            <h4 className="text-sm font-semibold mb-3">AI Response</h4>
                            <Card className="bg-muted/30">
                              <CardContent className="p-4">
                                <ScrollArea className="max-h-96">
                                  <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown>{task.responseText}</ReactMarkdown>
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* Raw JSON */}
                      {task.rawResponse && task.rawResponse !== "{}" && (
                        <>
                          <Separator />
                          <div className="p-4">
                            <button
                              onClick={() => setShowRawJson(isRawJsonVisible ? null : task.id)}
                              className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isRawJsonVisible ? "rotate-90" : ""}`} />
                              Raw API Response (JSON)
                            </button>
                            {isRawJsonVisible && (
                              <Card className="mt-2 bg-muted/30">
                                <CardContent className="p-4">
                                  <ScrollArea className="max-h-64">
                                    <pre className="text-xs font-mono whitespace-pre-wrap">
                                      {JSON.stringify(rawParsed, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Assign a task to an AI agent. The agent will use its configured model to complete it.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Assign to Agent *</Label>
              <Select
                value={formData.assignedAgentId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, assignedAgentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {activeAgents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="What should the agent do?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-desc">Instructions / Description</Label>
              <Textarea
                id="task-desc"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed instructions for the agent..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what you want the agent to produce. Include context and constraints.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
