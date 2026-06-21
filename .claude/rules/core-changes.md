# Core Changes — Read the Full Docs First

`src/core/*` is tightly interlocked (Kernel DI, 2-phase injection, Store subscriptions, event pipeline). A local-looking edit can break distant code. **Before changing anything under `src/core/`, read the relevant full docs — do not patch from a single file's local context:**

- `ARCHITECTURE.md` — Kernel/DI, layer rules, Store, content model, event system (the interlocking parts)
- `prompts/coding-rules.md` — full enforceable conventions
- `GUIDE.md` — architecture overview + workflow

## Load-bearing invariants (detail in ARCHITECTURE.md)

- **Layers**: L1 Kernel → L2 Config → L3 Logic → L4 Event; `helper/*` is a leaf. **L3 modules never import each other directly** — cross-reference via the Deps bag (`this.#$.<other>`), available only after Phase 2. Need another L3 ref at init time? Do it in `_init()` (runs after Phase 2), not the constructor.
- **No circular deps** — enforced by dependency-cruiser. Resolve via `$`, never a direct import.
- **Constructor patterns are fixed**: L3 = `constructor(kernel)` → store `#kernel` / `#$` / `#store`; Module = `(inst, $, ...)`. Don't reach into `kernel` beyond `kernel.$` and `kernel.store`.
- **Store**: mutate only via `store.set()` (fires subscribers); underscored keys (`_range`, `_preventBlur`) still go through `set()`. `store.subscribe()` returns an unsubscribe — call it on destroy. `store.mode` / `_editorInitFinished` are direct props, not in `#state`.
- **Content model**: classify nodes via `format.isLine/isBlock/isClosureBlock` and `component.is/isInline` — never hardcode tag-name checks. Closure blocks/lines (`TH`/`TD`, `PRE`) trap the cursor; Enter/Backspace logic must respect them.
- **Types**: `SunEditor.Kernel` only for constructor params; `SunEditor.Deps` for `this.$`, event params, module deps.

## After core edits

Run `npm run check:arch` (layer/cycle boundaries) and `npm run ts-build`, then the `/post-edit` pipeline.
