import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Info } from "lucide-react";

import {
  FieldError,
  GenerateButton,
  OutputPanel,
  PageHeader,
  ToolCard,
} from "@/components/tool-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { delay, generateResearch } from "@/lib/mock-ai";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Enter a topic or paste a link and get a structured briefing with a summary, key insights, recommendations and important points.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content: "Structure any topic into a summary, insights, recommendations and caveats.",
      },
    ],
  }),
  component: ResearchAssistant,
});

function ResearchAssistant() {
  const [topic, setTopic] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState(0);
  const [output, setOutput] = useState("");

  const run = async (nextVariant: number) => {
    if (!topic.trim()) {
      setError("Add a topic or question so there's something to research.");
      return;
    }
    setError(undefined);
    setLoading(true);
    setVariant(nextVariant);
    await delay();
    setOutput(generateResearch({ topic, url, variant: nextVariant }));
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="AI Research Assistant"
        description="Ask a question or name a topic and get a tidy briefing you can edit: summary, key insights, recommendations and things to watch out for."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ToolCard
          title="What would you like to look into?"
          description="A specific question gives a more useful briefing than a broad subject."
        >
          <div className="space-y-2">
            <Label htmlFor="topic">Topic or question *</Label>
            <Textarea
              id="topic"
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How do mid-sized companies introduce AI tools without disrupting existing workflows?"
            />
            <FieldError message={error} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Link to an article or page (optional)</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
          </div>

          <div className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Link summarising is a demonstration only. This prototype does not open or read the
              page you paste — it simply notes the link in the result. Real link reading would need a
              connected service.
            </p>
          </div>

          <GenerateButton loading={loading} onClick={() => run(variant)}>
            Generate briefing
          </GenerateButton>
        </ToolCard>

        <OutputPanel
          title="Research briefing"
          description="Summary, key insights, recommendations and important points — all editable."
          value={output}
          onChange={setOutput}
          onRegenerate={() => run(variant + 1)}
          loading={loading}
          emptyHint="Enter a topic or question and select Generate briefing to see a structured result here."
          rows={20}
        />
      </div>
    </div>
  );
}
