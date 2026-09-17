import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { NAV_ITEMS } from "@/components/app-sidebar";
import { PageHeader, ResponsibleAiNotice } from "@/components/tool-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Your workspace overview: email drafting, meeting summaries, task planning, research and chat, all in one prototype.",
      },
      { property: "og:title", content: "Dashboard — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "One dashboard for five AI-style productivity tools. Prototype with mock results.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const tools = NAV_ITEMS.filter((item) => item.url !== "/");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <PageHeader
        title="Welcome back"
        description="Pick a tool to get started. Give it a little context and it will draft something you can edit, copy and use straight away."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.url} to={tool.url} className="group block focus:outline-none">
            <Card className="h-full border-border/70 bg-card/60 transition-colors group-hover:border-primary/60 group-hover:bg-card group-focus-visible:border-primary">
              <CardHeader className="space-y-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
                  <tool.icon className="size-5" />
                </span>
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <CardDescription className="leading-relaxed">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open tool
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div className="space-y-2">
            <CardTitle className="text-base">Responsible AI</CardTitle>
            <ResponsibleAiNotice />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
