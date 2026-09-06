# Component Model — Launcher vs Full Plugin

How selectable in-content components (image, table, hr, pageBreak) are wired. Read this
before touching component selection/deletion, `pluginManager` component-checkers, or the
component controller/handle UI. Full API: `guide/custom-plugin.md`.

## Two registration paths — pick by how much the component needs

- **Full plugin** (`src/plugins/**`, `extends PluginX` + `static component(node)`): needed when
  the component owns UI (a controller toolbar, edit actions, resize/align) or per-instance
  state. The plugin instance owns its `Controller` and opens/closes it from lifecycle hooks.
  → `guide/custom-plugin.md#static-componentnode`, `#component-hooks-editorcomponent-interface`.
- **Launcher** (a lightweight object pushed to `#componentCheckers` in
  `src/core/logic/shell/pluginManager.js`): for components with **no actions but delete**
  (e.g. `pageBreak`). `component.select()` stores it as `currentPlugin`; the framework never
  attaches a controller to a launcher.

## Hook-name contract

`component.select()` sets `currentPlugin = info.launcher || $.plugins[pluginName]`, then the
selected-component keydown handler calls **`currentPlugin.componentDestroy(target)`**. A launcher
**must expose the same hook names a plugin would** — `componentDestroy` (not `destroy`),
`componentSelect`, `componentDeselect`. A renamed-but-unmirrored hook silently breaks delete
while still calling `preventDefault`/`stopPropagation`, so nothing happens and no error fires.

## Selection UI by component class

- `se-component-line-break` (hr, pageBreak): gets **line-breaker drag handles only**, never an
  auto controller. Keep siblings consistent — see [[design-principles]] (hr ↔ pageBreak).
- Figure/file components: controller + handle, owned and opened by the plugin's `componentSelect`.
- Inline components: zero-width-space anchoring, no line breaker.

## Controllers are plugin-owned

Only a full plugin instance can show a controller (`this.controller.open(...)` from
`componentSelect`). There is **no framework path** that opens a controller for a launcher.
Adding a controller to a launcher-based component means promoting it to a full plugin — a
structural change; weigh it via [[design-principles]] before doing it.
Reference: `guide/custom-plugin.md#example-3-custom-embed-modal-with-controller-typescript`.
