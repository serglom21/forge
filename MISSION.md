# SE-Copilot MVP — Mission

This file is the project's fixed contract. Claude Code may not edit it.

## What this tool does

Generates a runnable reference application instrumented with Sentry
that a Sales Engineer can demo live and share with a customer via
GitHub. Generated apps are pedagogical — verbose, well-commented,
easy to map to the customer's own codebase.

## MVP scope (2-day build)

One stack: Next.js + Express.
One pattern: distributed_transaction_visibility.
One validation path: generator produces an app that builds and boots.
One output mode: files on disk, Sentry dashboard as JSON file.

Everything else (more stacks, patterns, OAuth, dashboard push, seed
scripts, trace check) is explicitly week-2 work.

## Non-negotiables

1. Generated apps must pass `pnpm install --frozen-lockfile`,
   `tsc --noEmit`, and `next build`.
2. Generated apps must boot and respond 200 to /health on both
   frontend and backend within 30 seconds of `pnpm dev`.
3. The LLM never writes source code in generated apps. Only the
   deterministic generator writes code.
4. Files under `patterns/` are human-authored. Automated agents may
   not modify them.
5. The CI gate must be green at end of every session. Red = revert.
6. No silent scope expansion. Every Claude Code session runs against
   a plan file in `plans/`. Files outside that plan's "allowed" list
   may not be touched without raising it first.

## Artifact contract

Each generated project produces:

    <project-slug>/
    ├── README.md
    ├── IMPLEMENTATION_GUIDE.md
    ├── engagement-spec.json
    ├── sentry-dashboard.json
    └── reference-app/
        ├── frontend/
        ├── backend/
        ├── .env.example
        └── README.md

Every instrumented file has a sibling `<filename>.SENTRY.md`.

## Definition of done (any task)

- Matches its written plan in `plans/`
- No files outside the plan's allowed list were touched
- `make verify` passes locally
- CI gate passes on the PR
- Diff has been reviewed by a human
