# Overlay Placement — wrapper vs carrierWrapper

Where a floating/overlay element is appended is a **contract**, not a per-feature choice.
Reference implementations: `plugins/dropdown/table/services/table.{handle,resize,dot}.js` (wrapper),
`modules/contract/Controller.js` (carrierWrapper).

## The two layers

- **`wrapper`** (`.se-wrapper`, one per root, `frameContext.get('wrapper')`) — in-editor overlays that
  track content: resize guide lines, row/column move handles, dot launchers, line breakers, drag handle.
- **`carrierWrapper`** (`contextProvider.carrierWrapper`, one per editor, appended to `document.body`) —
  floating UI that must escape the editor box: controllers, modals, alerts, menu tray, SelectMenu
  anchors, loading, drag cursor.

## Pick by contract

**wrapper** when ALL hold:

- Positioned from `offset.getLocal()` — getLocal is wrapper-relative *by definition* (its offset walk
  stops at `.se-wrapper`; wrapper is `position: relative`). Never feed it global coords.
- One instance per root → create inside `contextProvider.applyToRoots`, and key element caches by the
  wrapper element (`WeakMap`) so multi-root lookups stay correct.
- Should follow the editor on outer-page scroll for free and be clipped to the editor box
  (`overflow: hidden`). Only **inner** scroll (wysiwyg/figure) needs your own reposition handler.
- In-editor stacking is enough (z-index single digits).

**carrierWrapper** when ANY hold:

- Must render outside the editor box or above toolbars (controllers: z-index 2147483641+, popover top layer).
- Positioned globally (`offset.setAbsPosition`) — then it also owes `_scrollReposition`-style upkeep.
- One per editor, shared across roots (e.g. the invisible SelectMenu anchor in `table.grid`).

## Failure modes (why mixing breaks)

- wrapper element fed global coords (or the reverse) → drifts on page scroll.
- Per-root element in carrierWrapper → manual root bookkeeping, silently wrong in multi-root.
- carrierWrapper element without reposition upkeep → detaches from its target on scroll/resize.

Escalating a wrapper overlay to carrierWrapper for one nicety is a structural promotion — weigh it
via [[design-principles]] first.
