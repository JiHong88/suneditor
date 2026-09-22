# Plugin Authoring Checklist

Always-on rules for writing or modifying a SunEditor plugin.
Full API: `guide/custom-plugin.md`. Full conventions: `prompts/coding-rules.md`.

- **Shape**: `extends` exactly one base (`PluginCommand`/`PluginDropdown`/`PluginModal`/...); `static key` (case-sensitive, matches `buttonList`; camelCase is valid); constructor's first line is `super(kernel)`. Register as **class references** (`plugins: [MyPlugin]`), never instances. New private implementation state uses `#private`; preserve inherited/public contracts. `static type` is inherited from the base.
- **Dependencies via `this.$` only**. Never import another plugin or L3 module directly; never reach into `kernel` (only `kernel.$` / `kernel.store` in core constructors).
- **WYSIWYG edits** reuse semantic `$.html` / `$.format` / `$.inline` / `$.component` APIs. If a specialized low-level edit is necessary, follow coding-rules §2 for validation, selection/cache and history ownership. Detached UI construction is separate.
- **One history owner per logical edit.** Push ownership and flags vary per API — check the ownership/flag tables in coding-rules §2 before adding a push. Never push from `onChange` or a read-only probe.
- **Events through `this.$.eventManager`** (`addEvent` / `addGlobalEvent`) — never raw `addEventListener`. Always `await` `triggerEvent` (returns a Promise; comparing it to `false` without await silently drops user cancels).
- **iframe-safe**: never `instanceof` (use `dom.check.*` / `this.$.instanceCheck.*`); never bare `window`/`document` (use `_w`/`_d` from `helper/env`, or `frameContext.get('_ww'/'_wd')`).
- **State containers** are distinct: `store` (runtime state) vs `context` (global UI) vs `frameContext` (per-frame DOM) vs `options`/`frameOptions`. Mutate via `store.set()` so subscribers fire.
- **i18n**: add new keys to `src/langs/en.js` only; reference as `this.$.lang.<key>`. No hardcoded UI strings.

Reference implementations: `src/plugins/command/blockquote.js` (simple), `src/plugins/dropdown/align.js` (dropdown), `src/plugins/modal/link.js` (modal+controller).

**Building a selectable in-content component** (image/table/hr/pageBreak-style)? Read [component-model](./component-model.md)
first — it covers full-plugin vs launcher, the `componentDestroy`/`componentSelect` hook-name
contract, and which components may own a controller.


New features must also follow [performance.md](./performance.md): reuse dispatch/modules, avoid inactive hot-path work, and verify cleanup and async frame ownership.
