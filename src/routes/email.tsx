import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EMAIL_TONES, delay, generateEmail, type EmailTone } from "@/lib/mock-ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Turn a purpose, a recipient and a few key points into a polished email draft in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Draft professional emails from a few notes, then edit and copy the result.",
      },
    ],
  }),
  component: EmailGenerator;
});

function EmailGenerator() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<EmailTone>("formal");
  const [errors, setErrors] = useState<{ purpose?: string; recipient?: string }>({});
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState(0);
  const [output, setOutput] = useState("");

  const run = async (nextVariant: number) => {
    const nextErrors: typeof errors = {};
    if (!purpose.trim()) nextErrors.purpose = "Tell the assistant what the email is about.";
    if (!recipient.trim()) nextErrors.recipient = "Add who the email is going to.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setVariant(nextVariant);
    await delay();
    setOutput(generateEmail({ purpose, recipient, keyPoints, tone, variant: nextVariant }));
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Smart Email Generator"
        description="Describe the situation in your own words, choose a tone, and get a complete draft you can edit before sending."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ToolCard
          title="Email details"
          description="The more context you give, the more useful the draft."
        >
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose or context *</Label>
            <Textarea
              id="purpose"
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Asking the finance team to approve the updated Q4 budget before Friday's board meeting"
            />
            <FieldError message={errors.purpose} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient *</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Thandi Mokoena, Finance Manager"
            />
            <FieldError message={errors.recipient} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Key points (one per line)</Label>
            <Textarea
              id="points"
              rows={5}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder={"Budget increased by 4%\nTraining spend moved to Q1\nNeed sign-off by Thursday"}
            />
            <p className="text-xs text-muted-foreground">Optional, but it makes the draft sharper.</p>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Tabs value={tone} onValueChange={(v) => setTone(v as EmailTone)}>
              <TabsList className="w-full">
                {EMAIL_TONES.map((t) => (
                  <TabsTrigger key={t.value} value={t.value} className="flex-1">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {EMAIL_TONES.find((t) => t.value === tone)?.hint}
            </p>
          </div>

          <GenerateButton loading={loading} onClick={() => run(variant)}>
            Generate email
          </GenerateButton>
        </ToolCard>

        <OutputPanel
          title="Generated email"
          description="Fully editable. Adjust anything before you copy it."
          value={output}
          onChange={setOutput}
          onRegenerate={() => run(variant + 1)}
          loading={loading}
          emptyHint="Your draft will appear here once you add the purpose and recipient, then select Generate email."
        />
      </div>
    </div>
  );
}
