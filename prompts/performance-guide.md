# Performance and Feature Guide

Read when adding a feature or changing event handling, traversal, rendering, caching or async
work. The always-on contract is [performance.md](../.agents/rules/performance.md); API behavior
and coding conventions are in [coding-rules.md](./coding-rules.md).

Current benchmark fixtures, budgets, commands and CI evidence: [Testing and Validation](../guide/testing.md#performance-baseline-and-budgets).

## Before implementation

Identify the nearest existing feature and trace its caller, shared services and teardown.
Search by behavior as well as the proposed method name. Read implementations and callers:
method names and JSDoc alone do not establish history, filtering or lifetime guarantees.

State briefly in the working plan:

1. Which existing owner and sibling implementation will be reused, and why a new helper is
   necessary if none fits. Keep a one-use helper local; share a real common contract without
   adding plugin-name branches or mode flags to unrelated core paths.
2. Which events invoke the feature and what work occurs while it is disabled/closed.
3. The affected subtree, history owner, frame scope and cleanup owner.
4. Which behavioral and performance checks address the changed path.

This is an implementation decision aid, not a requirement for a separate design document or
approval for routine changes. Preserve vanilla JS, optional plugins and no runtime dependencies.

## Reuse map

| Need | Existing owner / source to inspect |
| --- | --- |
| Insert or replace external HTML | `src/core/logic/dom/html.js`: `insert`, `set`, filtering and char checks |
| Low-level node insertion | Same file: `insertNode`; caller owns final history, and a node is not automatically trusted HTML |
| Block/list/inline editing | `format`, `listFormat`, `inline` in `src/core/logic/dom/`; inspect history/skip flags |
| Caret and structural boundaries | `selection`, `format`; `src/core/event/effects/ruleHelpers.js` for adjacent-line helpers |
| DOM checks, ancestor search, class/style operations | `src/helper/dom/`: `dom.check`, `dom.query`, `dom.utils` |
| Geometry and scroll positioning | `src/core/logic/dom/offset.js`, existing `Controller`, `SelectMenu`, toolbar positioning |
| Toolbar/menu/shortcut command dispatch | `src/core/logic/shell/commandDispatcher.js`; avoid a parallel command router |
| Dialog, controller, file/figure behavior | `src/modules/contract/` and `src/modules/manager/` |
| Menu/autocomplete UI | `src/modules/ui/SelectMenu.js`, `CommandMenu.js`, `src/plugins/field/autocomplete.js` |
| Public/plugin input hooks | `eventManager`, `pluginManager`; preserve existing hook order and cancellation semantics |
| Keyboard editing | `src/core/event/handlers/`, `reducers/`, `rules/`, `effects/`; extend the existing decision model |
| Deferred work | `src/helper/converter.js`: `debounce` and its `cancel()` method |

References illustrate a particular responsibility, not a blanket endorsement of every old
line. For example `CommandMenu` uses explicitly disposed raw listeners in a temporary flyout;
do not copy that as the default listener pattern. Prefer EventManager and delegation for new
code. If its tracking model cannot support a repeated short-lived resource, explain the gap
and address lifetime at the appropriate owner rather than silently adding an exception.

## Event and resource costs

- Toolbar and menu events are already delegated in `EventOrchestrator._addCommonEvents`.
  Reuse `data-command` routing instead of registering a listener for every row/button.
- `PluginManager` indexes hooks once and dispatches them in order. Add only needed hooks;
  do not scan all plugins or reorder/call them concurrently for every input. Both `true` and
  `false` terminate its hook loop; only return a boolean when that behavior is intended.
- `EventManager.addEvent` appends tracking records; `removeEvent` detaches listeners but
  does not prune those records. Repeated bind/unbind can retain detached DOM until `_init`.
  Prefer stable containers/handlers, especially in list rendering and open/close cycles.
- `addGlobalEvent` registers on the host window and the currently active iframe window.
  Do not assume it registers on every root or remembers the original iframe when removing.
  For a resource spanning frame changes, retain the concrete target/lifetime or close it
  before the switch. Verify the actual frame-switch caller and cleanup path.
- Timers, animation frames, observers, requests and Store subscriptions are separate
  resources: EventManager does not dispose them. Ensure the real host invokes cleanup;
  inventing an unused `destroy()` method is not cleanup.

## Hot paths and DOM work

`keydown`, `beforeinput`, `input`, `selectionchange`, pointer movement and scrolling are
repeated paths. A new feature must justify work added to these paths even when its output
does not change. In particular:

- Avoid whole-root `querySelectorAll`, `innerHTML`/`textContent` serialization, parse/clone
  passes and collections allocated per node when only the current line or selection matters.
  Whole-document operations such as import/export may need full traversal; do not impose a
  constant-time rule on them. Remove redundant passes and explain unavoidable work.
- Gather geometry before writing styles where practical. Reuse offset helpers and cached
  geometry only for its valid lifetime (scroll, resize, content, direction or root changes
  can invalidate it). Do not cache a live range across edits without checking its ownership.
- Keep mutable plugin/editor state per instance or per root. Module-level immutable lookup
  tables are useful; new global mutable selection/timer/request state couples editors.
- Do not replace every loop or introduce memoization on style grounds. Match local code and
  optimize actual repeated work. Avoid allocating a debounce wrapper inside the event handler.
- Preserve `useEnterFromBeforeInput` routing and composition guards. The Enter `beforeinput`
  path cancels native insertion synchronously before running async effects; moving it behind
  a public callback can produce duplicate native edits. Read both input and key handlers.

## Async ownership

Capture the concrete event frame/root and request identity before scheduling. The shared
`$.frameContext` is a moving view, not an immutable snapshot. When a request finishes, verify
the originating root still exists, the editor/UI still owns the request and the relevant
query/target has not changed. Use existing request cancellation where available, plus stale
result checks when cancellation cannot guarantee ordering. A canceled public hook must not
continue into a mutation. Do not insert into whichever frame happens to be active now.

## Validation proportional to the change

Run the [post-edit skill](../.agents/skills/post-edit/SKILL.md) for code changes. Select cases
from this matrix according to the behavior/resource actually changed:

| Change | Evidence to collect |
| --- | --- |
| New command/content feature | Expected DOM and caret, one logical undo/redo, `onChange`, read-only and char-limit behavior |
| Input/key handling | Native browser typing, Enter/Delete/Backspace at relevant boundaries, composition; jsdom action tests alone cannot prove native editing |
| Repeated DOM/selection path | Same operation on small/large and nested documents; traversal/serialization counts or browser duration samples |
| Listener/cache/timer/request | Repeated open/close, cancel, reset/destroy; no growing registrations or delayed stale writes; second editor remains unaffected |
| Frame-sensitive feature | DIV and iframe, switch between two roots during deferred work, independent histories |
| WYSIWYG geometry or horizontal behavior | DIV/iframe × LTR/RTL; relevant host/editor scroll, viewport edges and LTR → RTL → LTR switching in a real browser; follow [coordinate/direction rules](./coding-rules.md#coordinates-and-iframe-boundaries) |
| New optional plugin or imports | Disabled feature has no added recurring work; inspect production bundle impact when imports/dependencies change |

For a comparison, keep browser, fixture and action constant; state document size, repetitions
and metric. A deterministic call-count assertion can establish bounded work without flaky
millisecond thresholds. Use a browser trace/timing for layout or latency claims. Run only the
relevant cases; record untested cases explicitly. If a performance check cannot run, report
the limitation instead of asserting a speedup. Do not add a production profiler or benchmark
dependency merely to satisfy this guide.
