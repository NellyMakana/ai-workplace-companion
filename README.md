# AI Workplace Companion

Build a modern, responsive SaaS-style web app called AI Workplace Productivity Assistant.

Design

Clean, professional, minimal UI.

Dark theme: black/charcoal background, white text, purple highlights.

Modern dashboard with left sidebar navigation.

Responsive on desktop, tablet and mobile.

Use cards, tabs, buttons, text areas and clear visual hierarchy.

Add subtle hover states and polished spacing.

No unnecessary animations.

Important Architecture

This is a frontend-only prototype.

No backend.

No database.

No authentication.

Do not store user data.

Do not create accounts or persistent user profiles.

AI features should use realistic frontend mock responses/placeholders so the app works without a backend or API key.

Sidebar

Include:

Dashboard

Email Generator

Meeting Summarizer

Task Planner

Research Assistant

AI Chat

Dashboard

Show a welcome message and cards linking to each AI tool. Include a short Responsible AI disclaimer stating that AI-generated content should be reviewed before use and may contain errors.

1. Smart Email Generator

Create fields for:

Email purpose/context

Recipient

Key points

Tone: Formal, Friendly, Persuasive

Generate Email button

Display an editable generated email with Copy and Regenerate actions.

2. Meeting Notes Summarizer

Provide a large text area for meeting notes.
Generate a structured result containing:

Summary

Action Items

Decisions

Deadlines

Make the output editable and include Copy/Regenerate actions.

3. AI Task Planner

Allow users to enter tasks and select:

Daily Plan

Weekly Plan

Generate a prioritised schedule showing:

Priority

Task

Suggested time

Deadline

Status

Allow the generated plan to be edited.

4. AI Research Assistant

Provide a text field where users can:

Enter a topic/question

Paste a URL/link to an article or website

Generate a structured result containing:

Summary

Key Insights

Recommendations

Important Points

Clearly show that URL summarisation is a frontend prototype/mock feature and does not actually fetch external webpages without an API/backend.

5. AI Chat

Create a modern chatbot interface with:

User/AI message bubbles

Text input

Send button

Clear conversation button

Use mock AI responses so it functions without a backend.

General UX

Every tool should have clear instructions and useful placeholder text.

Generated outputs must be editable.

Include loading states when generating mock results.

Include empty states and validation for required fields.

Keep the experience simple enough for non-technical professionals.

Use consistent purple accent buttons and UI highlights.

Add the Responsible AI disclaimer in the dashboard/footer.

Build the complete polished frontend in one implementation and prioritise usability, responsiveness and visual consistency.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/608ace60-8843-4985-b10f-f9c15673d41a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
