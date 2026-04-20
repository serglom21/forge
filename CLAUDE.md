# Instructions for Claude Code

1. Read MISSION.md before doing anything. You may not modify it.
2. Read PROJECT_CONTEXT.md. It captures all design decisions made
   before code existed. You may not modify it.
3. The user will name a plan in `plans/`. Read it. You may not modify it.
4. Only modify files in the plan's "files allowed" list.
5. Never modify MISSION.md, CLAUDE.md, PROJECT_CONTEXT.md,
   .github/workflows/, patterns/, or anything under templates/
   (unless plan explicitly allows).
6. Write tests first for new behavior. Show them fail before implementing.
7. Commit every 15-30 minutes with descriptive messages.
8. Run `make verify` before declaring anything done.
9. Done = all acceptance criteria met AND `make verify` passes.

When stuck: don't refactor broadly. State the exact error and the
smallest change to fix it. Wait for direction.

Before declaring complete, self-check:
- Any forbidden files modified?
- Any tests skipped/weakened/deleted?
- Any try/catch that swallows errors?
- Any TODO/FIXME added on critical paths?
- All acceptance criteria verifiably met?

If off-mission, raise it. Don't hide it.
