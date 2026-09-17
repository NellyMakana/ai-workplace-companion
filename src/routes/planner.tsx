import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, RefreshCw, Trash2 } from "lucide-react";

import {
  EmptyState,
  FieldError,
  GenerateButton,
  LoadingBlock,
  PageHeader,
  ToolCard,
  copyText,
} from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  PLAN_STATUSES,
  delay,
  generatePlan,
  type PlanMode,
  type PlanRow,
} from "@/lib/mock-ai";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Enter your tasks and get a prioritised daily or weekly schedule with suggested times, deadlines and status you can edit.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Turn a task list into a prioritised daily or weekly schedule.",
      },
    ],
  }),
  component: TaskPlanner,
});

const PRIORITIES = ["High", "Medium", "Low"];

function TaskPlanner() {
  const [tasks, setTasks] = useState("");
  const [mode, setMode] = useState<PlanMode>("daily");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState(0);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [generated, setGenerated] = useState(false);

  const run = async (nextVariant: number) => {
    const lines = tasks.split("\n").filter((l) => l.trim());
    if (lines.length === 0) {
      setError("Add at least one task, one per line.");
      return;
    }
    setError(undefined);
    setLoading(true);
    setVariant(nextVariant);
    await delay();
    setRows(generatePlan(tasks, mode, nextVariant));
    setGenerated(true);
    setLoading(false);
  };

  const update = (id: string, field: keyof PlanRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const asText = () =>
    [
      `${mode === "daily" ? "Daily" : "Weekly"} plan`,
      ...rows.map(
        (r) => `[${r.priority}] ${r.task} — ${r.time} — due ${r.deadline} — ${r.status}`,
      ),
    ].join("\n");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="AI Task Planner"
        description="List what you need to get done and choose a timeframe. You'll get a prioritised schedule you can adjust row by row."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <ToolCard title="Your tasks" description="One task per line — keep them short and specific.">
          <div className="space-y-2">
            <Label htmlFor="tasks">Tasks *</Label>
            <Textarea
              id="tasks"
              rows={10}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={
                "Finish Q4 budget review\nPrepare board slides\nCall the new supplier\nApprove leave requests\nWrite team update"
              }
            />
            <FieldError message={error} />
          </div>

          <div className="space-y-2">
            <Label>Plan type</Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as PlanMode)}>
              <TabsList className="w-full">
                <TabsTrigger value="daily" className="flex-1">
                  Daily plan
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex-1">
                  Weekly plan
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {mode === "daily"
                ? "Slots your tasks into today's working hours."
                : "Spreads your tasks across the working week."}
            </p>
          </div>

          <GenerateButton loading={loading} onClick={() => run(variant)}>
            Generate plan
          </GenerateButton>
        </ToolCard>

        <Card className="border-border/70 bg-card/60">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-base">
                {mode === "daily" ? "Daily" : "Weekly"} schedule
              </CardTitle>
              <CardDescription>
                Every field is editable — change priority, timing, deadline or status.
              </CardDescription>
            </div>
            {rows.length > 0 ? (
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => copyText(asText())}>
                  <Copy className="size-4" /> Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => run(variant + 1)}
                  disabled={loading}
                >
                  <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Regenerate
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {loading && rows.length === 0 ? (
              <LoadingBlock />
            ) : rows.length === 0 ? (
              <EmptyState
                hint={
                  generated
                    ? "Every row was removed. Generate the plan again to start over."
                    : "Add your tasks and select Generate plan to build a prioritised schedule."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[46rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">Priority</TableHead>
                      <TableHead className="min-w-56">Task</TableHead>
                      <TableHead className="w-40">Suggested time</TableHead>
                      <TableHead className="w-40">Deadline</TableHead>
                      <TableHead className="w-36">Status</TableHead>
                      <TableHead className="w-12 text-right">Remove</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Select
                            value={row.priority}
                            onValueChange={(v) => update(row.id, "priority", v)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORITIES.map((p) => (
                                <SelectItem key={p} value={p}>
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.task}
                            onChange={(e) => update(row.id, "task", e.target.value)}
                            aria-label="Task"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.time}
                            onChange={(e) => update(row.id, "time", e.target.value)}
                            aria-label="Suggested time"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.deadline}
                            onChange={(e) => update(row.id, "deadline", e.target.value)}
                            aria-label="Deadline"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.status}
                            onValueChange={(v) => update(row.id, "status", v)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLAN_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(row.id)}
                            aria-label={`Remove ${row.task}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
