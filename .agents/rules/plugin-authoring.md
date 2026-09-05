# Plugin Authoring Checklist

Always-on rules for writing or modifying a SunEditor plugin.
Full API: `guide/custom-plugin.md`. Full conventions: `prompts/coding-rules.md`.

- **Shape**: `extends` exactly one base (`PluginCommand`/`PluginDropdown`/`PluginModal`/...); `static key` (lowercase, matches `buttonList`); constructor's first line is `super(kernel)`. Register as **class references** (`plugins: [MyPlugin]`), never instances. Instance fields are `#private`.
- **Dependencies via `this.$` only**. Never import another plugin or L3 module directly; never reach into `kernel` (only `kernel.$` / `kernel.store` in core constructors).
- **WYSIWYG DOM mutation** goes through `$.html` / `$.format` / `$.inline`. No `innerHTML =`, no `appendChild` into the wysiwyg root (skips sanitization, history, char-count).
- **`history.push` exactly once per logical edit.** Don't push again after a wrapper that already auto-pushes (`$.html.*`, `$.format.applyBlock`, `$.inline.apply`, `$.component.*`). Never push inside an `onChange` handler. Read-only ops never push.
- **Events through `this.$.eventManager`** (`addEvent` / `addGlobalEvent`) — never raw `addEventListener`. Always `await` `triggerEvent` (returns a Promise; comparing it to `false` without await silently drops user cancels).
- **iframe-safe**: never `instanceof` (use `dom.check.*` / `this.$.instanceCheck.*`); never bare `window`/`document` (use `_w`/`_d` from `helper/env`, or `frameContext.get('_ww'/'_wd')`).
- **State containers** are distinct: `store` (runtime state) vs `context` (global UI) vs `frameContext` (per-frame DOM) vs `options`/`frameOptions`. Mutate via `store.set()` so subscribers fire.
- **i18n**: add new keys to `src/langs/en.js` only; reference as `this.$.lang.<key>`. No hardcoded UI strings.

Reference implementations: `src/plugins/command/blockquote.js` (simple), `src/plugins/dropdown/align.js` (dropdown), `src/plugins/modal/link.js` (modal+controller).

**Building a selectable in-content component** (image/table/hr/pageBreak-style)? Read [[component-model]]
first — it covers full-plugin vs launcher, the `componentDestroy`/`componentSelect` hook-name
contract, and which components may own a controller.

