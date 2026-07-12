# Core Changes — Read the Full Docs First

`src/core/*` is tightly interlocked (Kernel DI, 2-phase injection, Store subscriptions, event pipeline). A local-looking edit can break distant code. **Before changing anything under `src/core/`, read the relevant full docs — do not patch from a single file's local context:**

- `ARCHITECTURE.md` — Kernel/DI, layer rules, Store, content model, event system (the interlocking parts)
- `prompts/coding-rules.md` — full enforceable conventions
- `GUIDE.md` — architecture overview + workflow

## Jump to the right section first (by edit context)

`ARCHITECTURE.md` is ~650 lines. **Start** with the section that matches your edit (fast path) — you don't have to read all of it up front for a scoped change:

| If you're editing… | Read first |
|---|---|
| Kernel init, DI, injection order, `_init()` timing | [ARCHITECTURE.md#the-2-phase-injection-strategy](../../ARCHITECTURE.md#the-2-phase-injection-strategy) + [#dependency-access-patterns](../../ARCHITECTURE.md#dependency-access-patterns) |
| A layer/circular-import error (`check:arch` fails) | [ARCHITECTURE.md#layer-dependency-rules](../../ARCHITECTURE.md#layer-dependency-rules) |
| Store keys, `store.set()`, subscriptions | [ARCHITECTURE.md#4-state-management-the-store](../../ARCHITECTURE.md#4-state-management-the-store) |
| Enter/Backspace/Delete, node classification, closure blocks | [ARCHITECTURE.md#6-content-model](../../ARCHITECTURE.md#6-content-model) |
| Keydown/event pipeline, rules/effects, 3-stage processing | [ARCHITECTURE.md#3-stage-event-processing](../../ARCHITECTURE.md#3-stage-event-processing) + [#event-pipeline-internal](../../ARCHITECTURE.md#event-pipeline-internal) |
| Multi-root / per-frame (`frameContext`) behavior | [ARCHITECTURE.md#7-multi-root-architecture](../../ARCHITECTURE.md#7-multi-root-architecture) |
| Component select/delete, controllers, launchers | [[component-model]] rule (then `guide/custom-plugin.md#component-hooks-editorcomponent-interface`) |

**When one section isn't enough, read the whole `ARCHITECTURE.md`.** The hazard core code guards
against is a local-looking edit breaking distant code, so escalate to the full doc when your
change: spans multiple rows of the table above, crosses subsystems (DI ↔ Store ↔ events),
alters an invariant/contract rather than logic inside one, or you can't tell how it interlocks.
Fast path is the default; full read is the safety net — not optional when the edit is broad.

- **Layers**: L1 Kernel → L2 Config → L3 Logic → L4 Event; `helper/*` is a leaf. **L3 modules never import each other directly** — cross-reference via the Deps bag (`this.#$.<other>`), available only after Phase 2. Need another L3 ref at init time? Do it in `_init()` (runs after Phase 2), not the constructor.
- **No circular deps** — enforced by dependency-cruiser. Resolve via `$`, never a direct import.
- **Constructor patterns are fixed**: L3 = `constructor(kernel)` → store `#kernel` / `#$` / `#store`; Module = `(inst, $, ...)`. Don't reach into `kernel` beyond `kernel.$` and `kernel.store`.
- **Store**: mutate only via `store.set()` (fires subscribers); underscored keys (`_range`, `_preventBlur`) still go through `set()`. `store.subscribe()` returns an unsubscribe — call it on destroy. `store.mode` / `_editorInitFinished` are direct props, not in `#state`.
- **Content model**: classify nodes via `format.isLine/isBlock/isClosureBlock` and `component.is/isInline` — never hardcode tag-name checks. Closure blocks/lines (`TH`/`TD`, `PRE`) trap the cursor; Enter/Backspace logic must respect them.
- **Types**: `SunEditor.Kernel` only for constructor params; `SunEditor.Deps` for `this.$`, event params, module deps.

## After core edits

Run `npm run check:arch` (layer/cycle boundaries) and `npm run ts-build`, then the `/post-edit` pipeline.
