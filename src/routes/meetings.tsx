import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  FieldError,
  GenerateButton,
  OutputPanel,
  PageHeader,
  ToolCard,
} from "@/components/tool-shell";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { delay, generateMeetingSummary } from "@/lib/mock-ai";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Paste rough meeting notes and get a structured summary with action items, decisions and deadlines you can edit and copy.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into a clear summary, actions, decisions and deadlines.",
      },
    ],
  }),
  component: MeetingSummarizer,
});

function MeetingSummarizer() {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState(0);
  const [output, setOutput] = useState("");

  const run = async (nextVariant: number) => {
    if (notes.trim().length < 20) {
      setError("Paste at least a couple of lines of notes so there's something to summarise.");
      return;
    }
    setError(undefined);
    setLoading(true);
    setVariant(nextVariant);
    await delay();
    setOutput(generateMeetingSummary(notes, nextVariant));
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Meeting Notes Summarizer"
        description="Drop in your raw notes — bullet points, half sentences, anything. You'll get back a summary, action items, decisions and deadlines."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ToolCard
          title="Your meeting notes"
          description="One thought per line works best. Include names and dates if you have them."
        >
          <div className="space-y-2">
            <Label htmlFor="notes">Meeting notes *</Label>
            <Textarea
              id="notes"
              rows={16}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                "Weekly ops sync — 12 people\nSipho: website launch slipped to next Thursday\nAgreed to freeze new feature requests until launch\nNeed updated pricing page copy from marketing\nBudget for extra contractor approved\nFollow up with vendor about invoice by Friday"
              }
              className="resize-y"
            />
            <FieldError message={error} />
          </div>

          <GenerateButton loading={loading} onClick={() => run(variant)}>
            Summarize notes
          </GenerateButton>
        </ToolCard>

        <OutputPanel
          title="Structured summary"
          description="Summary, action items, decisions and deadlines — all editable."
          value={output}
          onChange={setOutput}
          onRegenerate={() => run(variant + 1)}
          loading={loading}
          emptyHint="Paste your notes on the left and select Summarize notes to see a structured breakdown here."
          rows={20}
        />
      </div>
    </div>
  );
}
