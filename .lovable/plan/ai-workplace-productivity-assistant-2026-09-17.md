# AI Workplace Productivity Assistant

A frontend-only prototype: five AI tools plus a dashboard, all powered by realistic mock responses. No backend, no sign-in, nothing stored — refreshing the page starts clean.

## Look and feel

Dark charcoal/black surfaces, white text, purple accents on buttons, active nav items and highlights. Left sidebar navigation on desktop, collapsing into a slide-over menu on tablet/mobile. Cards, tabs, text areas, generous spacing, subtle hover states, no decorative animation.

## Pages

**Dashboard** — welcome message, one card per tool linking to it, and a Responsible AI notice: AI-generated content may contain errors and should be reviewed before use. The same notice sits in the footer on every page.

**Smart Email Generator** — fields for purpose/context, recipient, key points, and a tone choice (Formal, Friendly, Persuasive). Generate produces a full editable email draft with Copy and Regenerate.

**Meeting Notes Summarizer** — large notes text area. Output is a structured, editable set of sections: Summary, Action Items, Decisions, Deadlines, with Copy and Regenerate.

**AI Task Planner** — enter tasks (one per line) and pick Daily or Weekly. Output is an editable table: Priority, Task, Suggested time, Deadline, Status. Rows can be edited, status changed, and rows removed.

**AI Research Assistant** — topic/question field plus an optional URL field. Output sections: Summary, Key Insights, Recommendations, Important Points, all editable. A clear note states URL summarisation is mocked and no external page is actually fetched.

**AI Chat** — message bubbles for user and assistant, text input, Send, and Clear conversation. Replies are mock text with a short "thinking" state. History is session-only.

## Shared behaviour

- Required fields validated before generating, with inline messages.
- Loading state on every Generate action (short simulated delay).
- Empty states before the first generation explaining what the tool does.
- Every generated output is editable text; Copy puts it on the clipboard with confirmation.
- Plain-language helper text and realistic placeholder examples on each field.

## Technical notes

- TanStack Start file routes: `/` (dashboard), `/email`, `/meetings`, `/planner`, `/research`, `/chat`, sharing a sidebar layout rendered in the root route.
- Dark purple design tokens defined in `src/styles.css` (`@theme inline` + `:root`/`.dark`); components use semantic tokens only, no hardcoded colors.
- shadcn components (button, card, tabs, textarea, input, select, table, toast/sonner) for consistency.
- Mock generators live in `src/lib/mock-ai.ts`: deterministic-but-varied templates that interpolate the user's input so output feels responsive; Regenerate picks a different variant.
- Chat UI built on AI Elements primitives (conversation, message, prompt-input, shimmer) with a local mock responder, session state only.
- Per-route `head()` metadata with unique titles and descriptions.
