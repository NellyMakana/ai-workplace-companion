import { type ReactNode } from "react";
import { Copy, RefreshCw, Loader2, Sparkle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </header>
  );
}

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

export function ToolCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
      {footer ? <div className="px-6 pb-6">{footer}</div> : null}
    </Card>
  );
}

export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Your browser blocked copying — select the text and copy manually.");
  }
}

export function GenerateButton({
  loading,
  children,
  onClick,
}: {
  loading: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} disabled={loading} className="w-full sm:w-auto">
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Generating…
        </>
      ) : (
        <>
          <Sparkle className="size-4" /> {children}
        </>
      )}
    </Button>
  );
}

export function OutputPanel({
  title,
  description,
  value,
  onChange,
  onRegenerate,
  loading,
  emptyHint,
  rows = 18,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (next: string) => void;
  onRegenerate: () => void;
  loading: boolean;
  emptyHint: string;
  rows?: number;
}) {
  return (
    <Card className="border-border/70 bg-card/60">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {value ? (
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => copyText(value)}>
              <Copy className="size-4" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Regenerate
            </Button>
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {loading && !value ? (
          <LoadingBlock />
        ) : value ? (
          <Textarea
            value={value}
            rows={rows}
            onChange={(e) => onChange(e.target.value)}
            className="resize-y whitespace-pre-wrap font-normal leading-relaxed"
            aria-label={`${title} — editable result`}
          />
        ) : (
          <EmptyState hint={emptyHint} />
        )}
      </CardContent>
    </Card>
  );
}

export function LoadingBlock() {
  return (
    <div className="space-y-3" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" /> Drafting your result…
      </p>
      {[92, 78, 96, 64, 84, 70].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-muted"
          style={{ width: `${w}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function EmptyState({ hint }: { hint: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 px-6 py-10 text-center">
      <Sparkle className="size-5 text-primary" />
      <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ResponsibleAiNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
      <span className="font-medium text-foreground">Responsible AI:</span> AI-generated content can
      be inaccurate or incomplete. Always review, edit and fact-check anything produced here before
      you use or share it. This prototype runs entirely in your browser — no account, no storage, no
      external requests.
    </p>
  );
}
