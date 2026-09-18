/**
 * Frontend-only "AI" engine.
 * No network calls, no API keys, no persistence. Everything is produced locally,
 * but the input is genuinely parsed — keywords, owners, dates, urgency and intent
 * are extracted and rewritten into new sentences rather than echoed back.
 */

export const MOCK_DELAY = 900;

export function delay(ms: number = MOCK_DELAY) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function pick<T>(items: T[], variant: number): T {
  return items[Math.abs(variant) % items.length]!;
}

function bulletize(raw: string): string[] {
  return raw
    .split(/\n|;|•/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function sentences(raw: string): string[] {
  return raw
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function titleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function sentenceCase(value: string): string {
  return titleCase(value.replace(/\s+/g, " ").replace(/[.\s]+$/, ""));
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","if","to","of","in","on","for","with","about","at","by","from",
  "is","are","was","were","be","been","being","that","this","these","those","it","its","as","we",
  "i","you","he","she","they","them","our","your","their","his","her","not","no","do","does","did",
  "so","than","then","there","here","have","has","had","will","would","can","could","should","may",
  "might","must","need","needs","needed","want","wants","also","just","very","more","most","some",
  "any","all","into","out","up","down","over","under","again","new","get","got","make","makes",
  "please","kindly","regarding","asking","ask","let","us","me","my",
]);

/** Content words, most significant first (longer + repeated words win). */
function keywords(raw: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const word of raw.toLowerCase().match(/[a-z][a-z'&-]{2,}/g) ?? []) {
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([word]) => word);
}

function phrase(words: string[], fallback: string): string {
  if (!words.length) return fallback;
  return words.slice(0, 3).join(", ").replace(/, ([^,]*)$/, " and $1");
}

const DATE_PATTERN =
  /\b(today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week|end of (?:the )?(?:day|week|month|quarter)|eod|eow|q[1-4]|\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{1,2}\s*(?:am|pm))\b/i;

const URGENT_PATTERN =
  /\b(urgent|asap|immediately|today|critical|blocker|blocked|overdue|deadline|escalat\w*|must|eod|now|priority)\b/i;
const LOW_PATTERN =
  /\b(sometime|eventually|nice to have|backlog|when possible|later|whenever|optional|idea|explore|maybe)\b/i;
const DECISION_PATTERN =
  /\b(agreed|decided|decision|approved|signed off|sign-off|confirmed|chose|chosen|settled|will not|won't|rejected|final)\b/i;
const ACTION_PATTERN =
  /\b(will|to do|action|follow up|followup|send|share|prepare|draft|review|check|call|email|update|fix|book|schedule|chase|confirm|write|build|test|deliver|organise|organize|arrange|contact|investigate|assign)\b/i;

/** Pull "Name: ..." or "Name will ..." owners out of a line. */
function extractOwner(line: string): { owner?: string; rest: string } {
  const colon = line.match(/^([A-Z][\w'-]+(?:\s+[A-Z][\w'-]+)?)\s*[:\u2013-]\s*(.+)$/);
  if (colon) return { owner: colon[1]!, rest: colon[2]!.trim() };
  const will = line.match(/^([A-Z][\w'-]+(?:\s+[A-Z][\w'-]+)?)\s+(?:will|to|is going to|agreed to)\s+(.+)$/);
  if (will) return { owner: will[1]!, rest: will[2]!.trim() };
  return { rest: line.trim() };
}

function extractDate(line: string): string | undefined {
  const match = line.match(DATE_PATTERN);
  return match ? match[0] : undefined;
}

/** Turn a fragment into a proper sentence with a verb-led shape. */
function asStatement(fragment: string): string {
  let text = fragment.replace(/\s+/g, " ").replace(/[.;,]+$/, "").trim();
  text = text.replace(/^(?:need to|needs to|we need to|must|should|please)\s+/i, "");
  if (!text) return "";
  return `${titleCase(text)}.`;
}

/* ------------------------------------------------------------------ email */

export type EmailTone = "formal" | "friendly" | "persuasive";

export const EMAIL_TONES: { value: EmailTone; label: string; hint: string }[] = [
  { value: "formal", label: "Formal", hint: "Polished and professional" },
  { value: "friendly", label: "Friendly", hint: "Warm and approachable" },
  { value: "persuasive", label: "Persuasive", hint: "Confident and action-driven" },
];

type Intent = "request" | "update" | "followup" | "invite" | "thanks" | "issue" | "general";

function detectEmailIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/\b(approve|approval|sign off|sign-off|permission|request|could you|can you|need you to|ask(?:ing)? (?:for|the)|authorise|authorize)\b/.test(t))
    return "request";
  if (/\b(follow(?:ing)? up|reminder|chase|still waiting|no response|checking in)\b/.test(t)) return "followup";
  if (/\b(meeting|invite|book|schedule|call|workshop|session|catch up|availability)\b/.test(t)) return "invite";
  if (/\b(thank|thanks|grateful|appreciate|well done|congrat)\b/.test(t)) return "thanks";
  if (/\b(issue|problem|delay|delayed|bug|complaint|concern|apolog|mistake|error|risk|blocked)\b/.test(t))
    return "issue";
  if (/\b(update|progress|status|report|summary|inform|fyi|announce|share)\b/.test(t)) return "update";
  return "general";
}

const SUBJECT_LEAD: Record<Intent, string[]> = {
  request: ["Request:", "Approval needed:", "Action requested:"],
  update: ["Update:", "Status update:", "Progress on"],
  followup: ["Following up:", "Quick follow-up:", "Gentle reminder:"],
  invite: ["Invitation:", "Time to discuss", "Scheduling:"],
  thanks: ["Thank you —", "Appreciated:", "Thanks for"],
  issue: ["Heads-up:", "Issue to flag:", "Important:"],
  general: ["Regarding", "Quick note:", "About"],
};

const INTENT_OPENER: Record<Intent, Record<EmailTone, string[]>> = {
  request: {
    formal: [
      "I am writing to request your support on a matter that requires your approval before it can move forward.",
      "I would be grateful for your assistance with an item that now needs your formal sign-off.",
    ],
    friendly: [
      "I've got something small I need a hand with, and you're the right person to ask.",
      "I wanted to ask a quick favour — it shouldn't take much of your time.",
    ],
    persuasive: [
      "There's one decision standing between us and real progress here, and it sits with you.",
      "A short yes from you unlocks work that's already prepared and ready to go.",
    ],
  },
  update: {
    formal: [
      "I would like to provide you with a brief update on where matters currently stand.",
      "Please find below a short summary of recent progress for your awareness.",
    ],
    friendly: [
      "Quick update from my side so you're in the loop on how things are going.",
      "Thought I'd share where we've landed so far — nothing urgent, just so you know.",
    ],
    persuasive: [
      "Progress has been strong, and the results so far make a clear case for keeping momentum.",
      "The latest numbers are encouraging, and I think they point to an obvious next step.",
    ],
  },
  followup: {
    formal: [
      "I am following up on my previous correspondence, as I have not yet received a response.",
      "I wanted to revisit this matter, which I believe is still awaiting your attention.",
    ],
    friendly: [
      "Just floating this back to the top of your inbox in case it slipped past.",
      "No pressure at all — circling back on this one since I hadn't heard yet.",
    ],
    persuasive: [
      "I'm coming back to this because the window to act is narrowing, and the upside is still there.",
      "This is worth one more minute of your attention — the opportunity hasn't closed yet.",
    ],
  },
  invite: {
    formal: [
      "I would like to propose a meeting to discuss this properly and agree on next steps.",
      "I am writing to arrange a suitable time for us to review this together.",
    ],
    friendly: [
      "Fancy a quick chat about this? I think fifteen minutes would cover it.",
      "Could we grab some time together? Easier to talk it through than type it out.",
    ],
    persuasive: [
      "Let's put fifteen minutes in the diary — that's all it takes to settle this.",
      "One short conversation will move this further than another week of emails.",
    ],
  },
  thanks: {
    formal: [
      "I wanted to take a moment to express my sincere appreciation for your contribution.",
      "Please accept my thanks for the support you have given on this.",
    ],
    friendly: [
      "Just a quick note to say thank you — it genuinely made a difference.",
      "I wanted to say thanks properly rather than let it go unmentioned.",
    ],
    persuasive: [
      "Thank you — the results speak for themselves, and they're worth building on.",
      "Your input made this work, which is exactly why I'd like to keep it going.",
    ],
  },
  issue: {
    formal: [
      "I am writing to bring an issue to your attention so that it can be addressed promptly.",
      "I would like to make you aware of a concern that may affect our current timeline.",
    ],
    friendly: [
      "I wanted to flag something early rather than let it become a surprise later.",
      "Small bump in the road to tell you about — better you hear it from me now.",
    ],
    persuasive: [
      "There's a problem here, and it's fixable — but only if we act on it this week.",
      "I'd rather raise this now while it's still cheap to solve.",
    ],
  },
  general: {
    formal: [
      "I am writing to share some information that I believe will be of relevance to you.",
      "I wanted to bring the following to your attention for your consideration.",
    ],
    friendly: [
      "Wanted to drop you a quick note about something on my mind.",
      "Hope your week's going well — just a short one from me.",
    ],
    persuasive: [
      "I'll keep this brief, because the important part is simple.",
      "There's a straightforward opportunity here worth a moment of your time.",
    ],
  },
};

const INTENT_CLOSER: Record<Intent, Record<EmailTone, string[]>> = {
  request: {
    formal: ["I would be grateful for your confirmation at your earliest convenience.", "Please let me know if you require anything further before approving."],
    friendly: ["Just reply when you get a chance and I'll take it from there.", "Let me know if you'd like anything changed before you say yes."],
    persuasive: ["A one-line reply is all I need and I'll handle the rest today.", "Say the word and I'll get this moving immediately."],
  },
  update: {
    formal: ["I will continue to keep you informed as matters develop.", "Please let me know if you would like further detail on any point above."],
    friendly: ["Shout if you want more detail on any of it.", "I'll keep you posted as things move along."],
    persuasive: ["Happy to walk you through what's driving these results whenever you like.", "I'd suggest we build on this while the momentum is there."],
  },
  followup: {
    formal: ["I would appreciate an indication of when I might expect your response.", "Do let me know if this should be directed elsewhere."],
    friendly: ["Totally fine if you're swamped — just let me know either way.", "A quick yes or no is plenty."],
    persuasive: ["Even a short reply keeps this on track.", "Let me know today and we stay ahead of the deadline."],
  },
  invite: {
    formal: ["Kindly advise which times would suit you and I will send an invitation.", "I am happy to work around your availability."],
    friendly: ["Send me a couple of times that work and I'll set it up.", "Any slot that suits you works for me."],
    persuasive: ["Pick a slot and I'll bring everything we need to decide.", "Give me fifteen minutes this week and we'll close it out."],
  },
  thanks: {
    formal: ["Thank you once again for your support.", "I look forward to working with you again."],
    friendly: ["Thanks again — really appreciated.", "Owe you one!"],
    persuasive: ["Let's keep this going — the next step is the easy part.", "Thanks again; I think there's more we can do here."],
  },
  issue: {
    formal: ["I will proceed on this basis unless you advise otherwise.", "Please let me know how you would prefer to handle this."],
    friendly: ["Happy to talk it through if that's easier.", "Let me know how you'd like to play it."],
    persuasive: ["Confirm the approach and I'll start on it straight away.", "The sooner we agree, the smaller this stays."],
  },
  general: {
    formal: ["Please do not hesitate to contact me should you require clarification.", "I look forward to hearing your thoughts."],
    friendly: ["Let me know what you think whenever suits.", "Give me a shout if anything's unclear."],
    persuasive: ["Let me know and I'll take it from there.", "Happy to move on this as soon as you are."],
  },
};

const POINT_FRAMES: Record<EmailTone, string[]> = {
  formal: ["Please note that {p}.", "It is worth highlighting that {p}.", "For your awareness, {p}.", "I would draw your attention to the fact that {p}."],
  friendly: ["Just so you know, {p}.", "Worth mentioning: {p}.", "One thing to flag — {p}.", "Also, {p}."],
  persuasive: ["Crucially, {p}.", "This matters because {p}.", "Consider that {p}.", "The clearest win here: {p}."],
};

function lowerFirst(value: string): string {
  const t = value.trim().replace(/[.\s]+$/, "");
  if (!t) return "";
  if (/^[A-Z]{2,}/.test(t)) return t; // keep acronyms
  return t.charAt(0).toLowerCase() + t.slice(1);
}

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
  const firstName = name.split(/[\s,]+/)[0] || "there";
  const combined = `${purpose} ${keyPoints}`;
  const intent = detectEmailIntent(combined);
  const topicWords = keywords(purpose, 4);
  const topic = phrase(topicWords, "the matter below");
  const dueDate = extractDate(combined);

  const subject = `${pick(SUBJECT_LEAD[intent], variant)} ${sentenceCase(topic)}`.replace(/\s+/g, " ");

  const greeting = tone === "formal" ? `Dear ${name},` : `Hi ${firstName},`;
  const opener = pick(INTENT_OPENER[intent][tone], variant);
  const context = `Specifically, this concerns ${lowerFirst(topic)}${
    dueDate ? `, where timing matters: we are working to ${dueDate.toLowerCase()}` : ""
  }.`;

  const bodyLines: string[] = [];
  if (points.length === 1) {
    bodyLines.push(pick(POINT_FRAMES[tone], variant).replace("{p}", lowerFirst(points[0]!)));
  } else if (points.length > 1) {
    bodyLines.push(
      tone === "formal"
        ? "The main considerations are set out below:"
        : tone === "friendly"
          ? "Here's the short version:"
          : "Three things make the case:",
    );
    bodyLines.push(
      ...points.slice(0, 6).map((p, i) => {
        const owner = extractOwner(p);
        const date = extractDate(p);
        const base = sentenceCase(owner.rest);
        const suffix = [
          owner.owner ? `owner: ${owner.owner}` : "",
          date ? `timing: ${date}` : "",
        ].filter(Boolean);
        return `${i + 1}. ${base}${suffix.length ? ` (${suffix.join("; ")})` : ""}`;
      }),
    );
  }

  const ask =
    intent === "request"
      ? `Could you confirm whether you are happy to proceed${dueDate ? ` by ${dueDate.toLowerCase()}` : ""}?`
      : intent === "invite"
        ? "Would a short call work better than email for this?"
        : intent === "issue"
          ? "My suggestion is that we agree on a response before it affects anything downstream."
          : intent === "followup"
            ? "If it's easier, a one-line reply telling me where it stands is plenty."
            : "";

  const closer = pick(INTENT_CLOSER[intent][tone], variant);
  const signOff =
    tone === "formal" ? "Kind regards,\n[Your name]" : tone === "friendly" ? "Thanks,\n[Your name]" : "Best,\n[Your name]";

  return [
    `Subject: ${subject}`,
    "",
    greeting,
    "",
    `${opener} ${context}`,
    bodyLines.length ? "" : undefined,
    bodyLines.length ? bodyLines.join("\n") : undefined,
    ask ? "" : undefined,
    ask || undefined,
    "",
    closer,
    "",
    signOff,
  ]
    .filter((section): section is string => section !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/* --------------------------------------------------------------- meetings */

export function generateMeetingSummary(notes: string, variant: number): string {
  const lines = bulletize(notes);
  const topicWords = keywords(notes, 6);
  const themes = phrase(topicWords.slice(0, 3), "the current workstream");
  const secondary = phrase(topicWords.slice(3, 5), "");

  const actions: string[] = [];
  const decisions: string[] = [];
  const deadlines: string[] = [];
  const context: string[] = [];

  for (const line of lines) {
    const { owner, rest } = extractOwner(line);
    const date = extractDate(line);
    const statement = asStatement(rest);
    if (!statement) continue;

    if (DECISION_PATTERN.test(line)) {
      decisions.push(`• ${statement.replace(/^(Agreed|Decided|Approved)\b[:,]?\s*/i, "")}${owner ? ` (raised by ${owner})` : ""}`);
    } else if (ACTION_PATTERN.test(line)) {
      actions.push(
        `${statement} — owner: ${owner ?? "[assign]"}${date ? `, due ${date}` : ""}`,
      );
    } else {
      context.push(statement);
    }

    if (date) {
      deadlines.push(`• ${date.charAt(0).toUpperCase() + date.slice(1)} — ${statement.replace(/\.$/, "")}${owner ? ` (${owner})` : ""}`);
    }
  }

  const participants = [
    ...new Set(lines.map((l) => extractOwner(l).owner).filter((o): o is string => Boolean(o))),
  ];

  const opening = pick(
    [
      "The discussion centred on",
      "This session focused on",
      "The team worked through",
    ],
    variant,
  );

  const summary = [
    `${opening} ${lowerFirst(themes)}${secondary ? `, with supporting discussion around ${lowerFirst(secondary)}` : ""}.`,
    participants.length
      ? `Contributions came from ${phrase(participants, "the attendees")}.`
      : "No individual owners were named in the notes, so accountability still needs confirming.",
    `${decisions.length} decision${decisions.length === 1 ? "" : "s"} ${decisions.length === 1 ? "was" : "were"} reached and ${actions.length} action${actions.length === 1 ? "" : "s"} ${actions.length === 1 ? "was" : "were"} identified.`,
    context.length
      ? `Background raised but not resolved: ${lowerFirst(context.slice(0, 2).join(" ")).replace(/\.$/, "")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "SUMMARY",
    summary,
    "",
    "ACTION ITEMS",
    ...(actions.length
      ? actions.map((a, i) => `${i + 1}. ${a}`)
      : ["1. No clear actions were stated — agree owners and next steps before the next meeting."]),
    "",
    "DECISIONS",
    ...(decisions.length
      ? decisions
      : ["• Nothing was formally decided; the open questions above carry over."]),
    "",
    "DEADLINES",
    ...(deadlines.length
      ? [...new Set(deadlines)]
      : ["• No dates were mentioned — assign target dates to each action item."]),
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

const DEEP_WORK = /\b(write|draft|design|plan|analyse|analyze|review|prepare|build|report|budget|strategy|research|slides|proposal)\b/i;
const QUICK_WIN = /\b(call|email|reply|approve|book|send|confirm|check|order|sign|file|update|ping|forward)\b/i;

/** Score each task so priority reflects urgency words, deadlines and effort. */
function scoreTask(task: string): { score: number; effort: "deep" | "quick" | "normal" } {
  let score = 50;
  if (URGENT_PATTERN.test(task)) score += 35;
  if (DATE_PATTERN.test(task)) score += 15;
  if (/\b(client|customer|board|ceo|director|legal|audit|payroll|invoice)\b/i.test(task)) score += 12;
  if (LOW_PATTERN.test(task)) score -= 35;
  const effort = DEEP_WORK.test(task) ? "deep" : QUICK_WIN.test(task) ? "quick" : "normal";
  if (effort === "quick") score -= 5;
  return { score, effort };
}

export function generatePlan(tasksRaw: string, mode: PlanMode, variant: number): PlanRow[] {
  const tasks = bulletize(tasksRaw);
  const slots = mode === "daily" ? DAILY_SLOTS : WEEK_DAYS;

  const scored = tasks.map((task, index) => {
    const { owner, rest } = extractOwner(task);
    const stated = extractDate(task);
    const { score, effort } = scoreTask(task);
    const clean = sentenceCase(rest.replace(URGENT_PATTERN, "").replace(/\s{2,}/g, " ")) || sentenceCase(rest);
    return { index, task: clean || titleCase(task), owner, stated, score, effort };
  });

  // Deep work goes early in the schedule, quick wins fill the gaps; urgency wins overall.
  const ordered = [...scored].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const weight = (e: string) => (e === "deep" ? 0 : e === "normal" ? 1 : 2);
    return weight(a.effort) - weight(b.effort) || a.index - b.index;
  });

  const stamp = Date.now();

  return ordered.map((item, position) => {
    const slot = slots[(position + variant) % slots.length]!;
    const priority = item.score >= 80 ? "High" : item.score >= 45 ? "Medium" : "Low";
    const fallbackDeadline =
      mode === "daily"
        ? priority === "High"
          ? "Today, 12:00"
          : priority === "Medium"
            ? "Today, 17:00"
            : "Tomorrow, 10:00"
        : priority === "High"
          ? "Tuesday"
          : priority === "Medium"
            ? "Thursday"
            : "Friday";

    return {
      id: `${stamp}-${item.index}-${position}`,
      priority,
      task: item.owner ? `${item.task} (${item.owner})` : item.task,
      time: item.effort === "deep" && mode === "daily" ? `${slot} (focus block)` : slot,
      deadline: item.stated ? titleCase(item.stated) : fallbackDeadline,
      status: position === 0 ? "In progress" : "Not started",
    };
  });
}

/* --------------------------------------------------------------- research */

type Question = "how" | "why" | "what" | "compare" | "should" | "cost" | "topic";

function detectQuestion(topic: string): Question {
  const t = topic.toLowerCase();
  if (/\b(vs\.?|versus|compare|comparison|better than|or\b.*\?)/.test(t)) return "compare";
  if (/^how\b|\bhow (do|to|can|should|might)\b/.test(t)) return "how";
  if (/^why\b|\bwhy (do|is|are|does)\b/.test(t)) return "why";
  if (/^what\b|\bwhat (is|are|does)\b/.test(t)) return "what";
  if (/\bshould (i|we)\b|\bis it worth\b/.test(t)) return "should";
  if (/\b(cost|price|pricing|budget|roi|cheap|expensive|spend)\b/.test(t)) return "cost";
  return "topic";
}

export function generateResearch(input: { topic: string; url: string; variant: number }): string {
  const { topic, url, variant } = input;
  const kind = detectQuestion(topic);
  const words = keywords(topic, 6);
  const subject = phrase(words.slice(0, 3), sentenceCase(topic).replace(/\?$/, ""));
  const angle = phrase(words.slice(3, 5), "delivery and ownership");
  const scope = sentences(topic).length > 1 ? "multi-part question" : "single focused question";

  const framing: Record<Question, string> = {
    how: `This is a process question: the useful answer describes a sequence, not a definition. For ${subject}, the practical route runs from a small controlled pilot, through measurement, to a decision about scaling.`,
    why: `This is a causal question. The drivers behind ${subject} are usually structural — incentives, ownership and habit — rather than technical, which is why tooling changes alone rarely shift the outcome.`,
    what: `This is a definitional question. ${sentenceCase(subject)} is best framed by what it changes in day-to-day work, rather than by its formal description.`,
    compare: `This is a trade-off question. Neither option in ${subject} wins outright; the decision turns on which constraint you care about most — speed, cost, control or effort to maintain.`,
    should: `This is a decision question. For ${subject}, the answer depends on whether the expected gain clears the cost of change, and whether someone owns the outcome afterwards.`,
    cost: `This is an economics question. The visible price of ${subject} is usually the smaller half; the larger half is time spent changing how people work.`,
    topic: `Treated as an overview of ${subject}, the most useful framing is practical: what changes, who is affected, and what to measure.`,
  };

  const insights: Record<Question, string[]> = {
    how: [
      "Sequence beats scale: one narrow use case done properly teaches more than a broad rollout.",
      `Progress on ${angle} stalls where a step has no named owner.`,
      "A two-week loop of do, measure, adjust is short enough to stay honest.",
    ],
    why: [
      "The stated reason and the operating reason are often different; look at what gets rewarded.",
      `Where ${angle} is unclear, people default to the older, safer process.`,
      "Resistance usually signals an unaddressed risk rather than reluctance.",
    ],
    what: [
      "Definitions matter less than boundaries: what is in scope, and what is explicitly not.",
      `In practice ${subject} shows up as changes to ${angle}.`,
      "Shared vocabulary early prevents expensive misalignment later.",
    ],
    compare: [
      "List the constraint each option breaks first — that is the real differentiator.",
      "Reversibility is undervalued: prefer the choice that is cheaper to undo.",
      `Total cost of ownership, including ${angle}, separates the options more than features do.`,
    ],
    should: [
      "Define what a no looks like before you start; otherwise every result reads as a yes.",
      "Small commitment, early evidence, explicit review date.",
      `Confirm who owns ${angle} after the decision, not just who makes it.`,
    ],
    cost: [
      "Split the estimate into licence, implementation and ongoing attention — the third is usually missed.",
      "Compare against the cost of the current manual effort, not against zero.",
      `Budget for ${angle}; unowned work quietly becomes the largest line item.`,
    ],
    topic: [
      "Start where the repeated manual effort is, since the payback is easiest to see.",
      "Pick two metrics before you begin rather than justifying results afterwards.",
      `Ownership of ${angle} predicts success better than the choice of tool.`,
    ],
  };

  const recommendations: Record<Question, string[]> = {
    how: ["Write the sequence down as numbered steps and name an owner for each.", "Run step one on a single team for two weeks.", "Review against your two metrics before adding any step."],
    why: ["Interview three people closest to the work and record their reasons verbatim.", "Compare stated goals with what is actually measured and rewarded.", "Fix the incentive before changing the process."],
    what: ["Agree a one-paragraph definition and circulate it.", "State clearly what is out of scope.", "Revisit the definition once real work has tested it."],
    compare: ["Score each option against your three hardest constraints.", "Trial the front-runner on a low-risk case.", "Record the decision and the assumption it rests on."],
    should: ["Set the success threshold and the review date now.", "Commit only to a pilot-sized version.", "Decide in advance what would make you stop."],
    cost: ["Build a three-line estimate: setup, running, and internal time.", "Baseline the current cost of doing nothing.", "Re-cost after the pilot with real numbers."],
    topic: ["Choose one specific outcome and a date to review it.", "Pilot with a small, willing group.", "Write up what worked in a page the whole team can read."],
  };

  const sourceLine = url.trim()
    ? `Link noted: ${url.trim()} — this prototype did not open or read the page, so nothing here comes from it.`
    : "No link supplied; this briefing is structured reasoning, not sourced research.";

  return [
    "SUMMARY",
    `${framing[kind]} ${pick(
      [
        "Most teams get further by narrowing the question than by gathering more information.",
        "The strongest results come from pairing one clear goal with a short feedback loop.",
        "Writing down assumptions early prevents the most expensive corrections later.",
      ],
      variant,
    )} (Interpreted as a ${scope}.)`,
    "",
    "KEY INSIGHTS",
    ...insights[kind].map((line) => `• ${line}`),
    "",
    "RECOMMENDATIONS",
    ...recommendations[kind].map((line, i) => `${i + 1}. ${line}`),
    "",
    "IMPORTANT POINTS",
    "• Treat every point above as a draft argument to test, not a verified fact.",
    "• Check anything you plan to share externally against a primary source.",
    `• ${sourceLine}`,
  ].join("\n");
}

/* ------------------------------------------------------------------- chat */

const DEMO_NOTE =
  "(Demo response — this prototype reasons locally from your wording and has no live AI model behind it.)";

export function mockChatReply(userMessage: string, index: number): string {
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();
  const words = keywords(trimmed, 4);
  const subject = phrase(words, "what you've described");

  if (!trimmed) return `Send me a sentence or two about what you're working on and I'll help you shape it.\n\n${DEMO_NOTE}`;

  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(lower)) {
    return "Hello! I'm your workplace assistant demo. Tell me what you're working on — an email to write, notes to tidy, a week to plan, or a decision to think through.";
  }
  if (/\bthank/.test(lower)) {
    return "You're welcome. Anything else you'd like to work through while you're here?";
  }

  const intent = detectEmailIntent(trimmed);
  const kind = detectQuestion(trimmed);
  const date = extractDate(trimmed);

  if (/\b(email|write|draft|message|reply)\b/.test(lower)) {
    return `For an email about ${subject}, I'd keep it to three moves: one line of context, the specific ask, and the deadline${
      date ? ` — which sounds like ${date}` : ""
    }. Tone depends on the reader: formal for anyone senior or external, friendly for your own team. The Email Generator page will build the full draft if you paste those details in.\n\n${DEMO_NOTE}`;
  }
  if (/\b(plan|schedule|priorit|busy|deadline|week|day|time)\b/.test(lower)) {
    return `Looking at ${subject}: I'd rank by consequence of slipping, not by how loud each item feels. Put the one thing with a real deadline${
      date ? ` (${date})` : ""
    } in your first focus block, batch the quick replies into one slot, and protect one gap for whatever lands unplanned. The Task Planner will lay that out as a table you can edit.\n\n${DEMO_NOTE}`;
  }
  if (/\b(meeting|notes|minutes|summar)\b/.test(lower)) {
    return `For notes on ${subject}, split what you have into three buckets: decisions made, actions with a named owner, and open questions. Anything that fits none of those is context and can be shortened heavily. Paste the raw notes into the Meeting Summarizer and it will do that split for you.\n\n${DEMO_NOTE}`;
  }
  if (intent === "issue" || /\b(problem|stuck|blocked|risk)\b/.test(lower)) {
    return `On ${subject}, I'd separate the symptom from the cause before deciding anything. Write one sentence on what's actually blocked, one on who can unblock it, and one on what happens if it waits a week — that third sentence usually sets the urgency.\n\n${DEMO_NOTE}`;
  }

  const shaped: Record<Question, string> = {
    how: `The practical route through ${subject} is a sequence: pick the smallest version you can finish this week, run it, then judge it against one measure you choose up front.`,
    why: `The reasons behind ${subject} are usually about ownership and incentives rather than method — worth checking who is accountable before changing the process.`,
    what: `The clearest way to pin down ${subject} is to describe what it changes in day-to-day work, and to say plainly what it doesn't cover.`,
    compare: `With ${subject}, neither option wins outright. Name the constraint you care about most — time, cost, control or upkeep — and the choice usually makes itself.`,
    should: `On ${subject}, I'd commit to a small version with a review date rather than a full decision now. Decide up front what result would make you stop.`,
    cost: `For ${subject}, price the internal time as well as the obvious spend, and compare against the cost of carrying on as you are rather than against zero.`,
    topic: `Taking ${subject} at face value: narrow it to one outcome you could show someone in two weeks, and the next step usually becomes obvious.`,
  };

  return `${shaped[kind]} ${pick(
    [
      "Want me to turn that into something concrete?",
      "Tell me the audience and the deadline and I'll sharpen it.",
      "Which part of that is least clear right now?",
    ],
    index,
  )}\n\n${DEMO_NOTE}`;
}
