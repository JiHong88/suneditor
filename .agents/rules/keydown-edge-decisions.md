# Backspace/Delete — One Decision Model

Rules for `src/core/event/rules/keydown.rule.{backspace,delete}.js`. The two are mirrors (`front`/`end`).
Nearly every bug found here came from one habit: a branch deciding "where am I?" from **local siblings**,
so a list or quote boundary looked like the end of the document.

## The model — ask these, in this order

1. **Is the caret at the line's edge?** → `format.isEdgeLine(...)`, or `isEdgeBreakCaret(...)` when the
   caret sits on an empty line's `<br>`.
2. **What is the neighbouring line?** → `getAdjacentLine(format, formatEl, edge)` — the previous/next line
   **in document order**, stepping out of and into blocks *and out of nested list cells*, stopping at
   closure blocks (table cell) and the root. It returns `null` both at the document edge and when the
   neighbour is not a line (a component) — when the two must be told apart, use `getAdjacentElement`
   (same walk, unfiltered).
3. Then exactly one of:
   - **No neighbour at all** (`getAdjacentElement` is `null`) → document edge. `preventStop` so the
     browser can't reach outside, do nothing else. A component next door is **not** the document edge —
     fall through so the component-select branches can claim it; preventing there kills the key AND the
     component selection.
   - **This line is empty** → drop it, caret to the neighbour (`getEmptyLineMergeTarget` + the
     `emptyLine.merge*` effects). Same path for a plain line and a list cell.
   - **Neighbour is across a block boundary** (`neighbor.parentElement !== formatEl.parentElement`) →
     merge it ourselves (`mergeLineInto`). The browser merges these badly.
   - **Plain sibling lines** → return `true` without preventing. Native merge is correct here; don't
     reimplement it.

List cells are ordinary lines in this model (`isNormalLine('LI')` is `true`). Two deliberate exceptions,
both because a list owns a *different* gesture there:
- Backspace at the **head of a cell** outdents — the list branch owns it, so the merge branch skips cells.
- A cell holding a nested list belongs to `getNestedListTarget`, which lifts the list instead.

## Never navigate by local siblings

`formatEl.nextSibling` / `previousElementSibling` answer "within my parent", not "in the document". Using
them for edge decisions is what made Delete dead at the last `<li>` (last in the `<ul>` read as end of
document) and at a line before a list. **Use `getAdjacentLine`.** Raw sibling access is fine only for
inspecting the line's own children.

## The caret's neighbours may be invisible

`<br>` and zero-width text are filler, not content — a raw sibling test sees them and reports "not at the
edge", so the rule stands down and the browser just eats the filler: one keypress, nothing visible.
Producers clean up (`_normalizeEditRange` drops the zero-width once the caret moves onto the `<br>`;
`backspace.list.mergePrev` calls `stripTrailingBreaks`), and helpers skip filler when walking siblings.

## Fail open — a prevented key must do something

`contentEditable` hands us shapes we did not predict; the failure that hurts is the key doing **nothing**.

- Never `preventDefault` on a path that then makes no DOM change, no caret move, no component selection.
  The only deliberate no-ops: document start (Backspace), document end (Delete), closure-block boundaries.
- **Never report a key as handled when the branch had nothing to do** — that stops every rule behind it.
  Gate entry on the target existing (`getNestedListTarget(...)` before the nested-list branch) — but gate
  only the path that needs it: a collapsed caret needs a nested list to lift, while a real selection is
  handled (`html.remove`) regardless, so the gate must not cut that path off.
- No branch applies → return `true` without preventing, and let the browser do it.

## Verify before claiming it works

jsdom cannot perform native contentEditable edits, so `changed === false` only means *the editor* did not
act. Judge by emitted actions, and sweep:

- Dump the reduced action list (`reduceDeleteDown(actions, ports, ctx)`) — that is the real decision.
- Sweep a document set × {Backspace, Delete} × {front, end} over every line, flagging
  `prevented && DOM unchanged && caret unchanged`, any throw, and any lost table cell.
- Always check all four directions of a structure pair (p→list, list→p, and both Backspace/Delete) and the
  **paragraph equivalent**. A divergence between them is the bug.
