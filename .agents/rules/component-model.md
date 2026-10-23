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
  auto controller. Keep siblings consistent — see [design-principles](./design-principles.md) (hr ↔ pageBreak).
- Figure/file components: controller + handle, owned and opened by the plugin's `componentSelect`.
- Inline components: zero-width-space anchoring, no line breaker.

## Controller standard — selection UI vs standalone

Every `Controller` is one of two kinds; the component owns the selection either way.

- **Selection UI** (`selection: true`, inherited by `parents` children) — what a component opens from
  `componentSelect` (figure/table/math/audio/file toolbars, table dots and strips). It never takes the
  component's global listeners; the component skips keys/copy/clicks whose target is inside an open
  controller (`ui.isInsideController`). Closing a floating base one deselects; closing a child (or an
  in-editor `container: 'wrapper'` one, owner-driven) keeps the selection.
- **Standalone** (default) — no component behind it (link preview, autocomplete, slash menu). It strips the
  component's listeners while open.
- **Esc = one level per press.** An open child closes and consumes Esc; a base selection controller lets
  Esc reach the component, which deselects (one Esc for an image, as before). An open `SelectMenu` is a
  level too. `escape: 'all'` / `ui.closeAllControllers()` close everything and deselect.
- **"Esc handled" = `e.defaultPrevented`.** The layer that closes on Esc calls `preventDefault()` (a child
  controller also stops propagation; a SelectMenu keeps it for the owner's own keydown hooks). Every
  outer bubble-phase Esc handler (component deselect, Modal close) returns on `e.defaultPrevented`. A new
  Esc-closing layer needs both sides — the capture-phase controller listener can't be relied on to stop it.
- **Ask the registry through `ui`** (`isInsideController`, `getControllerAt`, `hasFloatingController`).
  No whitelists of controller classes, no counting open entries — both broke on every new controller kind.
- **Scroll keeps a selection session**: a click selection in the root, or a non-passive controller opened in
  it, survives a wysiwyg scroll; hover selections and other roots' controllers drop
  (`component.isHoverSelected`). `ui.on/offControllerContext` is deprecated — don't call it.

## Controllers are plugin-owned

Only a full plugin instance can show a controller (`this.controller.open(...)` from
`componentSelect`). There is **no framework path** that opens a controller for a launcher.
Adding a controller to a launcher-based component means promoting it to a full plugin — a
structural change; weigh it via [design-principles](./design-principles.md) before doing it.
Reference: `guide/custom-plugin.md#example-3-custom-embed-modal-with-controller-typescript`.
