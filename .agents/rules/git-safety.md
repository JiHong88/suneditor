# Git Safety & Isolation Testing

Hard guardrails — **never stage, unstage, commit, or stash without explicit user approval.**

- **Ask first, every time**: `git add`, `git commit`, `git reset`, `git restore`, `git stash`, `git rm`, `git checkout <path>`. These mutate the index/working tree. The user keeps their WIP staged as a checkpoint; `git stash push` / `git checkout HEAD -- <file>` once wiped that staged state entirely. These rules apply independently of host permission settings; do not assume a hook will block unsafe git commands.

- **For baseline / isolation testing, use a worktree — NOT stash or checkout.** To compare "my change vs HEAD" (e.g. to attribute a test failure), use a throwaway `git worktree` (delegate only when authorized and supported by the host). **Never** `git stash push` / `git checkout` the *shared* working tree to toggle changes in and out — that is the exact move that corrupted the user's staging.

- **Attribute failures by reasoning before running anything.** Check whether the change could even touch the failing area (file/module boundary). A different test filename does not prove independence: key handling can change the DOM used by a placeholder test. Trace dependencies and behavior; run a baseline only when it resolves a real attribution uncertainty.

- If you disturb the index/working tree by accident, **stop, tell the user, and offer to restore** — do not quietly "fix" it with more git commands.
