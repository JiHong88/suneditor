# Git Safety & Isolation Testing

Hard guardrails — **never stage, unstage, commit, or stash without explicit user approval.**

- **Ask first, every time**: `git add`, `git commit`, `git reset`, `git restore`, `git stash`, `git rm`, `git checkout <path>`. These mutate the index/working tree. The user keeps their WIP staged as a checkpoint; `git stash push` / `git checkout HEAD -- <file>` once wiped that staged state entirely. Also enforced by `ask` rules in `~/.claude/settings.json`.

- **For baseline / isolation testing, use a worktree — NOT stash or checkout.** To compare "my change vs HEAD" (e.g. to attribute a test failure), spawn an agent with `isolation: "worktree"`, or create a throwaway `git worktree`. **Never** `git stash push` / `git checkout` the *shared* working tree to toggle changes in and out — that is the exact move that corrupted the user's staging.

- **Attribute failures by reasoning before running anything.** Check whether the change could even touch the failing area (file/module boundary). A keydown-handler change cannot affect a CSS `::before` placeholder test; such failures are provably unrelated and need no baseline run at all.

- If you disturb the index/working tree by accident, **stop, tell the user, and offer to restore** — do not quietly "fix" it with more git commands.
