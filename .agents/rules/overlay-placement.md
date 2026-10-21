# Overlay Placement — wrapper vs carrierWrapper

Where a floating/overlay element is appended is a **contract**, not a per-feature choice.
Reference implementations: `plugins/dropdown/table/services/table.resize.js` (plain wrapper overlays),
`plugins/dropdown/table/services/table.{handle,dot}.js` (wrapper controllers — see below),
`modules/contract/Controller.js` (carrierWrapper).

## The two layers

- **`wrapper`** (`.se-wrapper`, one per root, `frameContext.get('wrapper')`) — in-editor overlays that
  track content: resize guide lines, row/column move handles, dot launchers, line breakers, drag handle.
- **`carrierWrapper`** (`contextProvider.carrierWrapper`, one per editor, appended to `document.body`) —
  floating UI that must escape the editor box: controllers, modals, alerts, menu tray, loading, drag cursor.

## Pick by contract

**wrapper** when ALL hold:

- Positioned from `offset.getLocal()` — getLocal is wrapper-relative *by definition* (its offset walk
  stops at `.se-wrapper`; wrapper is `position: relative`). Never feed it global coords.
- One instance per root → create inside `contextProvider.applyToRoots`, and key element caches by the
  wrapper element (`WeakMap`) so multi-root lookups stay correct. (Plain overlays only — an in-editor
  controller is one per editor, moved between wrappers; see below.)
- Should follow the editor on outer-page scroll for free and be clipped to the editor box
  (`overflow: hidden`). Only **inner** scroll (wysiwyg/figure) needs your own reposition handler.
- In-editor stacking is enough (z-index single digits).

**carrierWrapper** when ANY hold:

- Must render outside the editor box or above toolbars (controllers: z-index 2147483641+, popover top layer).
- Positioned globally (`offset.setAbsPosition`) — then it also owes `_scrollReposition`-style upkeep.
- One per editor, shared across roots (e.g. the handle-menu hosts in `table.grid`).

## In-editor controllers (`Controller` with `container: 'wrapper'`)

When a wrapper overlay needs **controller semantics** — child popups bound to it (`parents`), hiding with
the other controllers on a drag-handle hover, following the wysiwyg's inner scroll in the same tick — make
it a `Controller` with `container: 'wrapper'` and a `place` callback instead of hand-rolling them
(table dots and move-handle strips are the references).

- **One instance per editor**, moved into the active root's wrapper on `open` — no per-root copies.
- **`place(form, target)`** returns wrapper-local coords (`offset.getLocal` space) or `null` to hide; it may
  size the form. The controller writes position/display and the scroll baseline the core moves it from.
- **Inner content scroll** (a scrolled figure) is the owner's: call `resetPosition()`. Floating controllers
  positioned on an element inside it are re-anchored (or hidden) with it.
- **Owner-driven lifecycle**: no auto-close listeners, no deselect on close, no editor-state changes;
  registered `fixed`, so the core's deselect sweep leaves it to the owner. `ui.hasFloatingController()`
  skips it (`ControllerInfo.inWrapper`) — ask the registry through the `ui` queries, never iterate
  `ui.opendControllers` yourself. A component's in-editor controller is selection UI (`selection: true`),
  like its floating ones — see [[component-model]].

## Failure modes (why mixing breaks)

- wrapper element fed global coords (or the reverse) → drifts on page scroll.
- Per-root element in carrierWrapper → manual root bookkeeping, silently wrong in multi-root.
- carrierWrapper element without reposition upkeep → detaches from its target on scroll/resize.

Escalating a wrapper overlay to carrierWrapper for one nicety is a structural promotion — weigh it
via [[design-principles]] first.
