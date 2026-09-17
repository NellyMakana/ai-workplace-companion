/**
 * Frontend-only mock "AI" generators.
 * No network calls, no API keys, no persistence — everything is produced
 * locally from the user's own input using rotating templates.
 */

export const MOCK_DELAY = 900;

export function delay(ms: number = MOCK_DELAY) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function pick<T>(items: T[], variant: number): T {
  return items[Math.abs(variant) % items.length];
}

function bulletize(raw: string): string[] {
  return raw
    .split(/\n|;|•/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function titleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/* ------------------------------------------------------------------ email */

export type EmailTone = "formal" | "friendly" | "persuasive";

export const EMAIL_TONES: { value: EmailTone; label: string; hint: string }[] = [
  { value: "formal", label: "Formal", hint: "Polished and professional" },
  { value: "friendly", label: "Friendly", hint: "Warm and approachable" },
  { value: "persuasive", label: "Persuasive", hint: "Confident and action-driven" },
];

export function generateEmail(input: {
  purpose: string;
  recipient: string;
  keyPoints: string;
  tone: EmailTone;
  variant: number;
}): string {
  const { purpose, recipient, keyPoints, tone, variant } = input;
  const points = bulletize(keyPoints);
  const name = recipient.trim() || "there";
  const firstName = name.split(/\s+/)[0];
  const subjectPrefix = pick(
    ["Following up on", "Regarding", "Quick note on", "Next steps for"],
    variant,
  );
  const subject = `${subjectPrefix} ${titleCase(purpose).replace(/\.$/, "")}`;

  const openings: Record<EmailTone, string[]> = {
    formal: [
      `Dear ${name},\n\nI hope this message finds you well. I am writing regarding ${purpose.trim()}.`,
      `Dear ${name},\n\nThank you for your time. I would like to share an update concerning ${purpose.trim()}.`,
    ],
    friendly: [
      `Hi ${firstName},\n\nHope you're having a good week! I wanted to reach out about ${purpose.trim()}.`,
      `Hi ${firstName},\n\nQuick one from me — I wanted to touch base on ${purpose.trim()}.`,
    ],
    persuasive: [
      `Hi ${firstName},\n\nThere's a clear opportunity here, and I think it's worth five minutes of your time: ${purpose.trim()}.`,
      `Hi ${firstName},\n\nI'll keep this short because the value speaks for itself — ${purpose.trim()}.`,
    ],
  };

  const closings: Record<EmailTone, string[]> = {
    formal: [
      "Please let me know if you require any further detail. I would be glad to assist.\n\nKind regards,\n[Your name]",
      "I would welcome your thoughts at your earliest convenience.\n\nYours sincerely,\n[Your name]",
    ],
    friendly: [
      "Let me know what you think — happy to chat whenever suits you.\n\nThanks so much,\n[Your name]",
      "Give me a shout if anything's unclear. Always happy to help.\n\nCheers,\n[Your name]",
    ],
    persuasive: [
      "Can we lock in 15 minutes this week to move it forward? I'll bring the detail.\n\nBest,\n[Your name]",
      "If you're happy in principle, I'll get things moving today.\n\nBest,\n[Your name]",
    ],
  };

  const body = points.length
    ? `\n\nHere are the key points:\n${points.map((p) => `• ${titleCase(p)}`).join("\n")}`
    : "";

  return [
    `Subject: ${subject}`,
    "",
    pick(openings[tone], variant),
    body.trim(),
    "",
    pick(closings[tone], variant),
  ]
    .filter((section) => section !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/* --------------------------------------------------------------- meetings */

export function generateMeetingSummary(notes: string, variant: number): string {
  const lines = bulletize(notes);
  const take = (start: number, count: number) =>
    lines.filter((_, i) => i % 3 === start % 3).slice(0, count);

  const summarySeed = lines.slice(0, 3).join(" ");
  const summary = summarySeed
    ? `${pick(["The team met to review", "This session covered", "Discussion focused on"], variant)} ${summarySeed.toLowerCase()} The group aligned on the direction and agreed to follow up on the open items below.`
    : "The team reviewed progress, surfaced blockers and agreed on next steps.";

  const actions = take(0, 4);
  const decisions = take(1, 3);
  const deadlines = take(2, 3);

  return [
    "SUMMARY",
    summary,
    "",
    "ACTION ITEMS",
    ...(actions.length
      ? actions.map((a, i) => `${i + 1}. ${titleCase(a)} — owner: [assign]`)
      : ["1. No explicit actions captured — confirm owners with the team."]),
    "",
    "DECISIONS",
    ...(decisions.length
      ? decisions.map((d) => `• ${titleCase(d)}`)
      : ["• No formal decisions recorded in these notes."]),
    "",
    "DEADLINES",
    ...(deadlines.length
      ? deadlines.map(
          (d, i) =>
            `• ${titleCase(d)} — due ${pick(["end of this week", "next Friday", "in two weeks", "end of month"], variant + i)}`,
        )
      : ["• No dates mentioned — agree timings before the next meeting."]),
  ].join("\n");
}

/* ---------------------------------------------------------------- planner */

export type PlanMode = "daily" | "weekly";

export type PlanRow = {
  id: string;
  priority: string;
  task: string;
  time: string;
  deadline: string;
  status: string;
};

export const PLAN_STATUSES = ["Not started", "In progress", "Blocked", "Done"];

const DAILY_SLOTS = [
  "08:30 – 09:30",
  "09:45 – 11:00",
  "11:15 – 12:00",
  "13:00 – 14:15",
  "14:30 – 15:30",
  "15:45 – 16:30",
  "16:45 – 17:30",
];

const WEEK_DAYS = [
  "Monday morning",
  "Monday afternoon",
  "Tuesday morning",
  "Tuesday afternoon",
  "Wednesday morning",
  "Thursday morning",
  "Thursday afternoon",
  "Friday morning",
];

export function generatePlan(tasksRaw: string, mode: PlanMode, variant: number): PlanRow[] {
  const tasks = bulletize(tasksRaw);
  const slots = mode === "daily" ? DAILY_SLOTS : WEEK_DAYS;
  const priorities = ["High", "High", "Medium", "Medium", "Medium", "Low", "Low"];

  return tasks.map((task, i) => {
    const offset = (i + variant) % slots.length;
    return {
      id: `${Date.now()}-${i}`,
      priority: priorities[Math.min(i, priorities.length - 1)],
      task: titleCase(task),
      time: slots[offset],
      deadline:
        mode === "daily"
          ? pick(["Today, 12:00", "Today, 17:00", "Tomorrow, 10:00"], variant + i)
          : pick(["Wednesday", "Thursday", "Friday", "Next Monday"], variant + i),
      status: i === 0 ? "In progress" : "Not started",
    };
  });
}

/* --------------------------------------------------------------- research */

export function generateResearch(input: {
  topic: string;
  url: string;
  variant: number;
}): string {
  const { topic, url, variant } = input;
  const subject = titleCase(topic).replace(/\?$/, "");
  const sourceLine = url.trim()
    ? `Source referenced: ${url.trim()} (mock read — no external page was fetched)`
    : "Source: general knowledge overview (mock content)";

  return [
    "SUMMARY",
    `${subject} is best understood as a practical trade-off rather than a single answer. ${pick(
      [
        "Most organisations start small, measure the impact, then expand what works.",
        "The strongest results come from pairing a clear goal with a short feedback loop.",
        "Teams that document their assumptions early avoid the most expensive mistakes later.",
      ],
      variant,
    )}`,
    "",
    "KEY INSIGHTS",
    `• Adoption usually stalls on process and ownership, not on tooling.`,
    `• Quick wins in ${subject.toLowerCase()} tend to come from removing repeated manual steps.`,
    `• Measurement matters: pick two metrics before you start, not after.`,
    `• Stakeholder buy-in improves sharply when results are shown, not described.`,
    "",
    "RECOMMENDATIONS",
    `1. Define one specific outcome for ${subject.toLowerCase()} and a date to review it.`,
    "2. Run a two-week pilot with a small, willing group.",
    "3. Capture what worked in a short written summary the whole team can read.",
    "4. Decide up front what would make you stop or scale.",
    "",
    "IMPORTANT POINTS",
    "• Treat every generated point as a starting draft, not a verified fact.",
    "• Check claims against a primary source before sharing externally.",
    `• ${sourceLine}`,
  ].join("\n");
}

/* ------------------------------------------------------------------- chat */

const CHAT_REPLIES = [
  "Here's how I'd approach that: break it into the outcome you need, the constraints you're working with, and the first small step you can take today. Which of those is least clear right now?",
  "Good question. A simple structure works well here — start with the context, list your options, then note the trade-off for each. Want me to draft that structure with your details?",
  "I'd suggest keeping it short and specific. One clear ask per message tends to get a faster response than a long summary. Shall I sketch a version you can edit?",
  "That's a common bottleneck. Usually it's worth checking whether the step is genuinely required, or just habit. Which parts feel repetitive to you?",
  "Let's make this concrete: if you tell me the audience and the deadline, I can shape the tone and level of detail to match.",
];

export function mockChatReply(userMessage: string, index: number): string {
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();

  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(lower)) {
    return "Hello! I'm your workplace assistant demo. Ask me about drafting emails, planning your week, summarising notes or thinking through a work problem.";
  }
  if (lower.includes("thank")) {
    return "You're welcome. Anything else you'd like to work through?";
  }
  if (lower.endsWith("?")) {
    return `${pick(CHAT_REPLIES, index)}\n\n(Demo response — this prototype generates replies locally and has no live AI model behind it.)`;
  }
  return `${pick(CHAT_REPLIES, index + 1)}\n\n(Demo response — this prototype generates replies locally and has no live AI model behind it.)`;
}
