import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eraser, Loader2, Send } from "lucide-react";

import { PageHeader } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { delay, mockChatReply } from "@/lib/mock-ai";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "A conversational assistant demo for thinking through work problems. Replies are generated locally in your browser.",
      },
      { property: "og:title", content: "AI Chat" },
      {
        property: "og:description",
        content: "Chat through work problems with a prototype assistant. Session only, nothing saved.",
      },
    ],
  }),
  component: ChatPage,
});

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Help me prepare for a difficult conversation with a colleague",
  "How should I structure my week when everything feels urgent?",
  "What should I include in a project update for leadership?",
];

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, thinking]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;

    const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setThinking(true);
    await delay(1100);
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: "assistant", text: mockChatReply(text, prev.length) },
    ]);
    setThinking(false);
    inputRef.current?.focus();
  };

  const clear = () => {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="AI Chat"
          description="Talk through a work problem and get a considered reply. This conversation lives in this browser tab only and disappears when you leave."
        />
        <Button variant="outline" onClick={clear} disabled={messages.length === 0 && !input}>
          <Eraser className="size-4" /> Clear conversation
        </Button>
      </div>

      <Card className="flex min-h-[26rem] flex-col border-border/70 bg-card/60">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && !thinking ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
              <p className="max-w-md text-sm text-muted-foreground">
                Start the conversation — or try one of these:
              </p>
              <div className="flex w-full max-w-lg flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border/80 bg-background/40 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/60 hover:bg-primary/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
                      AI
                    </span>
                    <p className="max-w-[88%] whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {m.text}
                    </p>
                  </div>
                ),
              )}
              {thinking ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" /> Thinking…
                </div>
              ) : null}
            </>
          )}
          <div ref={endRef} />
        </CardContent>

        <div className="border-t border-border/70 p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask anything about your work day… (Enter to send, Shift+Enter for a new line)"
              className="min-h-11 flex-1 resize-none"
              aria-label="Message"
            />
            <Button
              onClick={() => send(input)}
              disabled={!input.trim() || thinking}
              size="icon"
              className="size-11 shrink-0"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
