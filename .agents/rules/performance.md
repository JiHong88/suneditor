# Performance Is Part of the Feature Contract

Apply to new features and changes to existing editing paths. Detailed workflow and source
references: [Performance and Feature Guide](../../prompts/performance-guide.md).

- **Find the existing owner first.** Trace a sibling feature from entry point to shared service,
  history and cleanup before adding code. Reuse `$` services, `dom.*`, module contracts and the
  command/event dispatchers. Extend the appropriate owner when reuse is missing; do not copy a
  DOM walker, positioning algorithm, listener system or history mechanism into a plugin.
- **Keep inactive features cheap.** An unused plugin must not add document scans, polling or
  permanent global listeners. Guard irrelevant events before traversing DOM, building arrays,
  serializing HTML or doing layout reads. Keep `active()` synchronous and limited to the
  supplied node/target; it runs repeatedly during toolbar selection updates.
- **Bound repeated work.** Prefer the affected line/subtree over the whole document. Avoid
  repeated traversal of the same subtree and read/write layout interleaving in loops. Cache
  stable references; any content/selection/geometry cache needs an explicit invalidation owner.
- **Geometry must support iframe and RTL.** For WYSIWYG targets, identify the source frame
  and destination coordinate space; reuse `$.offset` / `$.selection.getRects` rather than
  mixing iframe-local rects with host scroll or adding iframe offsets twice. For horizontal
  placement, alignment, handles and directional controls, distinguish physical left/right
  from logical start/end and respect `_rtl` / `setDir`. Verify DIV/iframe × LTR/RTL, including
  runtime direction changes; see [coordinate and direction rules](../../prompts/coding-rules.md#coordinates-and-iframe-boundaries).
- **Match resource lifetime to UI lifetime.** Use existing delegated events. Bind stable
  handlers once; opening a menu must not accumulate listeners or subscriptions. Remove
  temporary events on close/cancel, cancel scheduled work, disconnect observers and dispose
  subscriptions on teardown. EventManager tracking alone does not make repeated registration free.
- **Preserve editing timing.** Do not debounce caret edits, IME decisions or browser default
  cancellation. Use `converter.debounce` (including `.cancel()`) for deferrable work; use
  animation frames only for visual work that can be coalesced and canceled. Never defer a
  required `preventDefault()` until after an `await`.
- **One logical edit has one history owner** (ownership/flag tables: coding-rules §2).
  Redundant pushes still perform work even if identical snapshots are discarded. Do not bypass
  sanitization, char limits, read-only guards or undo to improve a timing number.
- **Async work belongs to its originating frame and request.** After an await/timer, reject
  stale results from a closed/replaced UI, changed query, destroyed editor or removed root.
  Do not blindly use the now-current `$.frameContext` or a stale cached range.
- **Verify cost where it is introduced.** For hot-path/new-feature changes, compare relevant
  work counts or browser timings on a small and large document, with the feature enabled and
  disabled. Check repeated open/close and multi-instance isolation when resources are added.
  Record the fixture, operation and result; do not claim a performance improvement from lint
  or jsdom timing alone. See the guide for the targeted validation matrix.
