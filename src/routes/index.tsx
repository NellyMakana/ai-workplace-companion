import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/components/app-sidebar";
import { ResponsibleAiNotice } from "@/components/tool-shell";
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
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,--theme(--color-primary/18%),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-2xl space-y-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" />
            Powered by AI
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Your <span className="text-primary">AI</span> Workplace{" "}
            <span className="text-primary">Assistant</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Five smart tools in one place: draft polished emails in seconds, turn messy meeting
            notes into clear action items, plan your week, research any topic, and chat through
            ideas — everything editable, ready to copy and use straight away.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/email">
                Start with Email Generator
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/chat">
                <MessagesSquare className="size-4" />
                Try AI Chat
              </Link>
            </Button>
          </div>
        </div>
      </section>


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
