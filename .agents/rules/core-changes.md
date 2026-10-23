# Core Changes — Read the Owning Contracts First

`src/core/*` interlocks DI, state, DOM and events. Read `prompts/coding-rules.md`, then the
architecture sections for the affected owners and callers. Do not patch from one file alone.

## Jump to the right section first (by edit context)

Start with the section that matches a scoped edit:

| If you're editing… | Read first |
|---|---|
| Kernel init, DI, injection order, `_init()` timing | [ARCHITECTURE.md#the-2-phase-injection-strategy](../../ARCHITECTURE.md#the-2-phase-injection-strategy) + [#dependency-access-patterns](../../ARCHITECTURE.md#dependency-access-patterns) |
| A layer/circular-import error (`check:arch` fails) | [ARCHITECTURE.md#layer-dependency-rules](../../ARCHITECTURE.md#layer-dependency-rules) |
| Store keys, `store.set()`, subscriptions | [ARCHITECTURE.md#4-state-management-the-store](../../ARCHITECTURE.md#4-state-management-the-store) |
| Backspace/Delete rules (`keydown.rule.backspace/delete.js`) | **[keydown-edge-decisions](./keydown-edge-decisions.md) rule — mandatory** (then [ARCHITECTURE.md#6-content-model](../../ARCHITECTURE.md#6-content-model)) |
| Enter, node classification, closure blocks | [ARCHITECTURE.md#6-content-model](../../ARCHITECTURE.md#6-content-model) |
| Keydown/event pipeline, rules/effects, 3-stage processing | [ARCHITECTURE.md#3-stage-event-processing](../../ARCHITECTURE.md#3-stage-event-processing) + [#event-pipeline-internal](../../ARCHITECTURE.md#event-pipeline-internal) |
| Multi-root / per-frame (`frameContext`) behavior | [ARCHITECTURE.md#7-multi-root-architecture](../../ARCHITECTURE.md#7-multi-root-architecture) |
| Offset, hit-testing, popup/handle placement, horizontal direction | [Coordinates and iframe boundaries](../../prompts/coding-rules.md#coordinates-and-iframe-boundaries) + [RTL and horizontal behavior](../../prompts/coding-rules.md#rtl-and-horizontal-behavior) |
| Component select/delete, controllers, launchers | [component-model](./component-model.md) rule (then `guide/custom-plugin.md#component-hooks-editorcomponent-interface`) |
| Adding/renaming/changing an editor option | [options-changes](./options-changes.md) rule |

**When one section isn't enough, read the whole `ARCHITECTURE.md`.** The hazard core code guards
against is a local-looking edit breaking distant code, so escalate to the full doc when your
change: spans multiple rows of the table above, crosses subsystems (DI ↔ Store ↔ events),
alters an invariant/contract rather than logic inside one, or you can't tell how it interlocks.
Fast path is the default; full read is the safety net — not optional when the edit is broad.

- **Layers**: cross-service references use Deps (`this.#$.<other>`) after Phase 2; initialize them in `_init()`, not constructors. Exact owned-helper/import exceptions and automated boundaries are documented in [layer rules](../../ARCHITECTURE.md#layer-dependency-rules).
- **No circular deps** — enforced by dependency-cruiser. Resolve via `$`, never a direct import.
- **Constructor patterns are fixed**: L3 = `constructor(kernel)` → store `#kernel` / `#$` / `#store`; Module = `(inst, $, ...)`. Don't reach into `kernel` beyond `kernel.$` and `kernel.store`.
- **Store**: mutate only via `store.set()` (fires subscribers); underscored keys (`_range`, `_preventBlur`) still go through `set()`. `store.subscribe()` returns an unsubscribe — call it on destroy. `store.mode` / `_editorInitFinished` are direct props, not in `#state`.
- **Never reassign/wrap a core instance's methods from outside in production code** (`this.#$.menu.dropdownOff = () => {…}`, monkey-patching `ui`/`selection`/etc.). It silently changes core behavior for *every* caller and can't be caught by `check:arch` or lint (runtime property assignment is invisible to static analysis). To react to a core lifecycle event, use a **subscribe hook** on that core module — e.g. `menu.subscribeDropdownOff(cb)` returns an unsubscribe (mirrors `store.subscribe()`). If the hook you need doesn't exist yet, add one to the core module (Set of listeners + emit + return unsubscribe) rather than patching. See `CommandMenu.#openFlyout` for the reference consumer.
- **Content model**: classify nodes via `format.isLine/isBlock/isClosureBlock` and `component.is/isInline` — never hardcode tag-name checks. Closure blocks/lines (`TH`/`TD`, `PRE`) trap the cursor; Enter/Backspace logic must respect them.
- **Types**: `SunEditor.Kernel` only for constructor params; `SunEditor.Deps` for `this.$`, event params, module deps.

## After core edits

Run the [post-edit pipeline](../skills/post-edit/SKILL.md) once. It includes architecture/export checks, generation and a separate type check; do not duplicate these runs. Import boundaries are automated; still review runtime `$` access, ownership and the symbols used on allowed import edges. Test-only cost probes must restore wrapped methods in `finally`.
