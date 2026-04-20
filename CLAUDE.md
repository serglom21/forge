# Instructions for Claude Code

1. Read MISSION.md before doing anything. You may not modify it.
2. The user will name a plan in `plans/`. Read it. You may not modify it.
3. Only modify files in the plan's "files allowed" list.
4. Never modify MISSION.md, CLAUDE.md, .github/workflows/, patterns/,
   or anything under templates/ (unless plan explicitly allows).
5. Write tests first for new behavior. Show them fail before implementing.
6. Commit every 15-30 minutes with descriptive messages.
7. Run `make verify` before declaring anything done.
8. Done = all acceptance criteria met AND `make verify` passes.

When stuck: don't refactor broadly. State the exact error and the
smallest change to fix it. Wait for direction.

Before declaring complete, self-check:
- Any forbidden files modified?
- Any tests skipped/weakened/deleted?
- Any try/catch that swallows errors?
- Any TODO/FIXME added on critical paths?
- All acceptance criteria verifiably met?

If off-mission, raise it. Don't hide it.
