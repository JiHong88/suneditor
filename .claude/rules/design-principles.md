# Design Principles — How to Decide (not just what to do)

The other rules say *what* to do mechanically. This one is for **judgment calls** — when a
change is possible but you must decide whether it's worth it. Apply these before proposing or
implementing structural changes; surface the trade-off to the user instead of silently building.

- **Cost vs value.** Weigh the structural cost (new plugin, new abstraction, migration,
  broadened API surface) against the concrete value. Don't promote a lightweight construct to a
  heavy one for a single action — e.g. don't turn a launcher-based component ([[component-model]])
  into a full plugin just to add one delete button when keyboard delete already works.
- **Consistency with siblings first.** New UI/behavior should match the closest existing peer.
  If `hr` (a line-break component) shows no controller, `pageBreak` shouldn't grow one in
  isolation — split UX across siblings is worse than a missing nicety. If a behavior is worth
  adding, prefer adding it to the shared family, not one member.
- **Smallest change that fixes the root cause.** Prefer the one-line contract fix over a
  refactor. Escalate scope only when the smaller fix can't reach the root cause (see the Iron
  Law: no fix without root cause).
- **Escalate structure only when multiple needs justify it.** A full plugin / controller / new
  layer earns its keep when it carries several actions or real per-instance state — not one.
- **Don't dump the user into a 700+ line doc.** When pointing at `GUIDE.md` /
  `ARCHITECTURE.md` / `custom-plugin.md`, link the specific section for the edit context — see
  the deep-link table in [[core-changes]].
