# Coding Rules

This document defines the **enforceable coding conventions** for SunEditor source code.
Read this before writing or modifying any `.js` file under `src/`.

- **What this is**: rules about which APIs to call when writing code.
- **What this is not**: file-level edit restrictions (see [`editing-rules.md`](./editing-rules.md)), architecture overview (see [`ARCHITECTURE.md`](../ARCHITECTURE.md)), or commit conventions (see [`guide/commit-types.md`](../guide/commit-types.md)).

For each rule: ✅ canonical pattern, ❌ anti-pattern, 💡 why.
ESLint checks syntax/style; dependency-cruiser checks only its configured import rules. Event lifetime, history ownership, L3 cross-service access and performance still require source review. Treat this as a checklist, not a claim of automatic enforcement.

---

## 0. The `$` access rule

Every consumer (plugin, L3 module, L4 orchestrator, module) accesses dependencies through the **Deps bag (`$`)**.

| Consumer | How `$` is obtained                                        |
| -------- | ---------------------------------------------------------- |
| Plugin   | `super(kernel)` → `this.$` auto-injected by KernelInjector |
| L3 / L4  | `constructor(kernel)` → store `kernel.$` in `#$` field     |
| Module   | `constructor(host, $, element, ...)` → `$` passed directly |

✅ Always go through `$`. Never import other L3 modules directly.
❌ Never reach into `kernel` itself except for `kernel.$` and `kernel.store` in core constructors.

> Background: [`ARCHITECTURE.md` §3](../ARCHITECTURE.md#3-corekernel--dependency-injection).

---

## 1. Events — `eventManager` only

All DOM listeners must go through `this.$.eventManager`. Raw `addEventListener` is forbidden in plugin and module code.

### ✅ DO

```javascript
// Element-bound listener — auto-tracked, auto-removed on destroy/setOptions
const info = this.$.eventManager.addEvent(element, 'click', this.onClick.bind(this));

// Temporary global listener — retain the handle in a declared private field
this.#esc ??= this.$.eventManager.addGlobalEvent('keydown', this.#onEsc); // handler bound once during setup

// On close/cancel, remove temporary listeners rather than waiting for editor teardown
this.#esc &&= this.$.eventManager.removeGlobalEvent(this.#esc);
```

### ❌ DON'T

```javascript
element.addEventListener('click', handler); // not tracked, leaks on destroy
window.addEventListener('keydown', handler); // wrong window in iframe mode
document.addEventListener('selectionchange', handler); // bypasses iframe-aware routing
```

💡 `src/core/config/eventManager.js` tracks both registration kinds for `_init()` teardown. Temporary UI still owns early cleanup. `removeEvent` detaches but retains tracking records until teardown; avoid repeated registration of rebuilt DOM. `addGlobalEvent` targets the host window and current iframe, not all roots. See [resource lifetime](./performance-guide.md#event-and-resource-costs).

### Public event hooks (`triggerEvent`)

`triggerEvent` calls the user-registered `events.onXxx` handler. It is **async** — always `await`.

```javascript
const result = await this.$.eventManager.triggerEvent('onPaste', { frameContext, event, data });
if (result === false) return; // user canceled
```

❌ Calling without `await` returns a Promise — comparing `Promise === false` is always false, silently dropping user cancels.

---

## 2. DOM mutation — go through `$.html` / `$.format` / `$.inline`

Use the existing semantic editing API for content changes. Detached toolbar/dialog DOM may be constructed directly with helpers. Low-level core DOM routines necessarily mutate nodes; specialized plugin edits (for example align styles) may also use helpers when no semantic wrapper fits, but their caller must own validation, selection/cache updates and history. Do not duplicate structural editing in a feature or assume every L3 method sanitizes and saves.

### ✅ DO

```javascript
this.$.html.set('<p>new</p>'); // replace, auto history.push(false)
this.$.html.insert('<strong>x</strong>', { selectInserted: true }); // insert at cursor
this.$.html.insertNode(node, { afterNode, skipCharCount: false }); // insert raw node

this.$.format.setLine(pElement); // wrap selection as line
this.$.format.applyBlock(blockquoteEl.cloneNode(false)); // apply block format
this.$.inline.apply(spanFormat, { stylesToModify: styleArray, strictRemove: true });
```

History ownership (verify the implementation and flags for the path being changed):

| API | History behavior |
| --- | --- |
| `$.html.set` / `$.html.insert` | Push on their normal content-edit paths |
| `$.html.insertNode` | Low-level insertion; no final history push of its own |
| `$.format.setLine` / `$.format.applyBlock` / `$.inline.apply` | Own their normal edit push; early returns may do nothing |
| `$.component.insert` | Pushes unless `skipHistory: true` |
| `$.component.select` / `$.component.deselect` | Selection/UI operations; no content history push of their own |

Do not add another push after a wrapper that owns the edit. For a lower-level composition,
trace nested calls and assign the final push to one owner. `insertNode` is not an HTML
sanitizer; keep external input on the cleaning path. Skip flags require a caller that already
performed the corresponding validation/batching, not a performance shortcut.

### ❌ DON'T

```javascript
wysiwygFrame.innerHTML = html; // no sanitization, no history, no char-count
container.appendChild(node); // bypasses format normalization
document.execCommand('bold', false); // deprecated, inconsistent across browsers
```

💡 `$.html.set` also handles `rootKey` for multi-root frames (`src/core/logic/dom/html.js`, `set`). Skipping it desyncs the history stack for that frame.

---

## 3. State — `store` for runtime, `options`/`context` are different things

Four distinct stores, not interchangeable:

| What you want                                    | Use                              |
| ------------------------------------------------ | -------------------------------- |
| Mutable runtime state (focus, range cache, etc.) | `this.$.store.get/set('key')`    |
| Global UI element (toolbar, statusbar)           | `this.$.context.get('key')`      |
| Per-frame DOM (wysiwyg root, `_ww`)              | `this.$.frameContext.get('key')` |
| Shared editor options                            | `this.$.options.get('key')`      |
| Per-frame options                                | `this.$.frameOptions.get('key')` |

### ✅ DO

```javascript
const hasFocus = this.$.store.get('hasFocus');
this.$.store.set('controlActive', true);

const unsub = this.$.store.subscribe('rootKey', (next, prev) => { ... });
// store the unsubscribe; call it on destroy

const wysiwyg = this.$.frameContext.get('wysiwyg');
const isIframe = this.$.frameOptions.get('iframe');
const toolbar = this.$.context.get('toolbar_main');
```

### ❌ DON'T

```javascript
this.$.store._range = newRange; // bypasses subscribers
this.$.frameContext.get('toolbar_main'); // toolbar is in `context`, not frame
this.$.options.get('iframe'); // iframe is a frame option
this.$.frameRoots.get(rootKey).wysiwyg; // reach through frameContext instead
```

💡 Underscored keys (`_range`, `_lastSelectionNode`, `_preventBlur`) are still valid `store.set` keys — but always go through `set()` so subscribers fire.

---

## 4. Selection & range

Three ways to get a range. Pick the right one:

| Goal                                                | Call                                                    |
| --------------------------------------------------- | ------------------------------------------------------- |
| Read cached range (cheap, most cases)               | `this.$.store.get('_range')`                            |
| Read live range from current selection              | `this.$.selection.getRange()`                           |
| Get range and ensure caret is inside a line element | `this.$.selection.getRangeAndAddLine(range, container)` |

After mutating selection, restore focus:

```javascript
this.$.selection.setRange(startNode, sOff, endNode, eOff);
this.$.focusManager.focus();
```

❌ `window.getSelection()` is wrong in iframe mode — it returns the parent window's selection. Use `this.$.selection.get()` (which routes through `frameContext._ww`).

---

## 5. iframe safety — never `instanceof`

iframe mode means objects live in a different realm; `instanceof HTMLElement` returns `false` for elements inside the iframe.

### ✅ DO

```javascript
import { _w, _d } from '../../helper/env';   // window/document references

if (dom.check.isElement(node)) { ... }
if (dom.check.isText(node)) { ... }
if (dom.check.isImage(node)) { ... }
if (this.$.instanceCheck.isNode(obj)) { ... }
if (this.$.instanceCheck.isRange(obj)) { ... }

const iframeWin = this.$.frameContext.get('_ww');
const iframeDoc = this.$.frameContext.get('_wd');
```

### ❌ DON'T

```javascript
if (el instanceof HTMLElement) { ... }     // false for iframe-side elements
if (obj instanceof Range) { ... }           // wrong realm
window.getComputedStyle(el);                 // use _w or frame's window
document.createElement('div');               // use _d
```

💡 The `dom.check.*` helpers use `nodeType` and `Object.prototype.toString.call(x)` internally — both cross-realm safe.

### Coordinates and iframe boundaries

Any offset, hit-test, drag/resize, caret popup or overlay calculation involving a WYSIWYG
target must support iframe mode. State the coordinate space at the boundary: frame viewport,
host viewport, host document or the positioned container. A raw `getBoundingClientRect()` or
pointer `clientX/clientY` belongs to its originating viewport; it cannot be combined directly
with host-window coordinates when the event/target is inside an iframe.

- Reuse `$.offset.getLocal`, `getGlobal`, `getWWScroll`, `setAbsPosition` or `setRangePosition`
  according to the destination, and `$.selection.getRects` for selection geometry. Inspect
  the method and a matching caller: these APIs are not interchangeable coordinate formats.
- `offset.getGlobal` includes the active iframe translation and host scroll in `top/left`;
  `fixedTop/fixedLeft` are host-viewport coordinates. Do not add those offsets again.
  `selection.getRects` also applies iframe translation on its relevant paths; preserve its
  returned rect/scroll contract rather than treating it as a raw iframe rect.
- `_w`/`_d` from `helper/env` refer to the host. Use the originating frame's `_ww`/`_wd` or
  the target's owning document/window when frame-local selection, style or viewport data is
  needed. Replacing bare `window` with `_w` alone does not make a calculation iframe-safe.
- Shared offset/selection services use the active frame. Verify target ownership, especially
  after deferred work or a root switch. Keep geometry reads together and invalidate caches
  on relevant scroll, resize, content, direction and frame changes.

### RTL and horizontal behavior

Treat direction as an implementation requirement whenever a change affects horizontal
positioning, alignment, ordering, indentation, drag/resize handles or directional controls.

- Use the existing editor UI direction, `$.options.get('_rtl')`, and the `setDir` lifecycle.
  Do not infer direction from the language name or retain a constructor-only direction value
  when `resetOptions({ textDirection: ... })` can change it at runtime. If the operation is
  about content with its own direction, inspect that content's direction separately.
- Distinguish physical `left/right` from logical `start/end`. Reuse the sibling's logical CSS
  or RTL rules and shared positioning code. Do not blindly swap physical coordinates, arrow
  keys, explicit left/right alignment commands or DOM order under RTL.
- Mirror once: `offset.setAbsPosition` already handles RTL horizontal placement, and existing
  CSS may already mirror a toolbar. Reversing its DOM order as well can cancel the intended
  result. Preserve `buttonList` order and follow the existing family behavior.
- Geometry/direction changes require browser coverage of **DIV + LTR, DIV + RTL, iframe + LTR,
  iframe + RTL**, with relevant host/editor scroll and viewport edges. Check LTR → RTL → LTR
  switching for cached placement, arrows and styles; include root switching when frame-scoped.

References: `src/core/logic/dom/offset.js`, `selection.js`, `src/core/logic/shell/ui.js`
(`setDir`), `src/modules/contract/Controller.js`, and `test/e2e/toolbar.rtl.order.spec.js`.

---

## 6. History & onChange

`history.push(delay, rootKey?)` is what triggers the public `onChange` event.

| Call                                  | Behavior                                                              |
| ------------------------------------- | --------------------------------------------------------------------- |
| `this.$.history.push(false)` | Immediate snapshot attempt; use for discrete edits |
| `this.$.history.push(true)` | Debounced by `historyStackDelayTime` (default 400ms), batches typing |
| `this.$.history.push(false, rootKey)` | Multi-root: push to a specific frame                                  |

Rules:

- **Any UI handler that mutates persisted wysiwyg DOM must end its chain with `history.push`.** It's what fires `onChange`.
- If a wrapper from §2 owns the push, **do not push again**. Identical snapshots are deduplicated, but redundant pushes still schedule frame sync and check content/file state; intermediate snapshots can split undo.
- **Read-only operations must not push.** Selection probes, hover effects, controller positioning — no push.
- **Never call `history.push` from inside an `onChange` handler.** It re-fires `onChange` → infinite loop.

---

## 7. DOM helpers — `dom.utils` / `dom.query` / `dom.check`

Import once at the top of the file:

```javascript
import { dom, numbers, unicode, converter, env, keyCodeMap } from '../../helper';
```

| Group       | Use for                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `dom.utils` | `createElement`, `addClass`/`removeClass`/`hasClass`, `getStyle`/`setStyle`, `changeElement`, `getAttributesToString`                      |
| `dom.query` | `getParentElement(node, tagOrFn)`, `getNodePath`, `getNodeFromPath`, `getListChildren`, `getEventTarget`                                   |
| `dom.check` | `isText`, `isElement`, `isList`, `isListCell`, `isTable`, `isTableCell`, `isFigure`, `isAnchor`, `isImage`, `isNonEditable`, `isEdgePoint` |

### ❌ DON'T

```javascript
element.classList.add('active');           // use dom.utils.addClass
element.style.color = 'red';               // use dom.utils.setStyle
const tag = node.parentNode.parentNode...; // use dom.query.getParentElement
node.nodeType === 1;                        // use dom.check.isElement
```

---

## 8. Imports & layer boundaries

Import conventions are enforced by `.dependency-cruiser.js`; exact existing ownership exceptions and review limits are in [Layer Dependency Rules](../ARCHITECTURE.md#layer-dependency-rules):

| Rule                                                                                  |
| ------------------------------------------------------------------------------------- |
| `helper/*` cannot import from `core/*`, `modules/*`, or `plugins/*`                   |
| `modules/*` cannot import from `core/*` or `plugins/*` — receives `$` via constructor |
| L3 services cross-reference via `$`; only documented owned-helper/constant edges are exempt |
| Plugins cannot import other plugins or their public barrel (same plugin submodules are fine), or import `core/logic` directly |

### ✅ DO

```javascript
import { PluginCommand } from '../../interfaces';
import { Modal, Controller, Figure } from '../../modules/contract';
import { dom, numbers } from '../../helper';

// inside the class, reach other L3 modules through $:
this.$.format.setLine(...);
this.$.selection.getRange();
```

### ❌ DON'T

```javascript
// L3 module reaching another L3 module directly
import Selection from './selection'; // forbidden in src/core/logic/dom/*

// helper reaching into core
import { format } from '../../core/logic/dom/format'; // forbidden in src/helper/*

// plugin importing another plugin
import Link from '../link'; // forbidden in src/plugins/*
```

---

## 9. Plugin shape

```javascript
import { PluginCommand } from '../../interfaces';
import { dom } from '../../helper';

class MyPlugin extends PluginCommand {
	static key = 'myPlugin'; // required, exact case-sensitive registration key
	// static type is inherited from PluginCommand; do not redeclare it.
	static className = 'se-btn-my'; // optional toolbar button class

	constructor(kernel, pluginOptions) {
		super(kernel); // required — injects this.$
		this.title = this.$.lang.myPlugin;
		this.icon = 'icon-name';
	}

	action(target) {
		// required for PluginCommand
		// ...
	}

	active(element, target) {
		// optional — selection-change hook
		if (element && element.nodeName === 'STRONG') {
			dom.utils.addClass(target, 'active');
			return true;
		}
		dom.utils.removeClass(target, 'active');
		return false;
	}
}

export default MyPlugin;
```

Required by base class:

| Base                          | Must implement                                                   | Optional                        |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| `PluginCommand`               | `action(target)`                                                 | `active`                        |
| `PluginDropdown`              | `action(target)`                                                 | `on(target)`, `off()`, `active` |
| `PluginDropdownFree`          | —                                                                | `on(target)`, `off()`           |
| `PluginModal`                 | `open(target)`                                                   | `init`, `close`                 |
| `PluginBrowser`               | `open(onSelect)`, `close()`                                      | —                               |
| `PluginPopup`                 | `show()`                                                         | —                               |
| `PluginField` / `PluginInput` | event hooks (`onInput`, `onKeyDown`, `toolbarInputChange`, etc.) | —                               |

### ❌ DON'T

- Skip `super(kernel)` → `this.$` is undefined.
- Omit `static key` → toolbar registration fails silently.
- Register plugins as instances (`plugins: [new MyPlugin()]`) — pass **class references**.

---

## 10. Modules — `(host, $, element, ...)` signature

`Modal`, `Controller`, `Browser`, `Figure`, etc. — instantiated by plugins:

```javascript
this.modal = new Modal(this, this.$, modalElement);

this.controller = new Controller(this, this.$, controllerElement, {
	position: 'bottom',
	disabled: false,
	parents: [],
	isWWTarget: true,
});

// Figure takes controls, not a DOM element, as its third argument.
this.figure = new Figure(this, this.$, figureControls, { sizeUnit: 'px' });
```

First arg is the **host plugin instance** (`this`), second is `$`. Remaining arguments are module-specific: inspect the constructor rather than assuming every module takes an element. Order matters — swapping breaks lifecycle hooks.

💡 Modules receive `$` directly (not `kernel`) because `kernel` instantiates modules indirectly through plugins; passing `kernel` would create a circular dep.

---

## 11. i18n — `this.$.lang.<key>`

```javascript
this.title = this.$.lang.font;
this.title = this.$.lang.tag_blockquote;
```

- Add new keys to **`src/langs/en.js` only** — other language files are auto-generated (see [`editing-rules.md`](./editing-rules.md#3-language-files-edit-enjs-only)).
- Prefer static keys over `this.$.lang[dynamicKey]`. Dynamic lookups can't be validated by the translation script.
- Hardcoded English strings in plugin UI = bug.

---

## 12. Async — `await` every public event call

Always `await`:

```javascript
await this.$.eventManager.triggerEvent('onPaste', { frameContext, event, data });
await this._callPluginEventAsync('onFilePasteAndDrop', { frameContext, event, file });
```

The first form returns a Promise that may resolve to `false` (user canceled), `true`, the result of the handler, or the sentinel `NO_EVENT` (no handler registered). Without `await`, you compare a Promise — always truthy.

❌ Plugin `action()` being declared `async` without callers awaiting silently drops errors. If `action` is async, document it via JSDoc so the caller knows.

---

## 13. Private fields & JSDoc types

- New implementation-private state uses `#privateField`. Keep documented/inherited plugin and module fields public (e.g., `title`, `icon`, `modal`, `controller`). Existing public/underscored members may have callers: inspect them before renaming; do not mechanically privatize legacy APIs.
- JSDoc types:
    - `@param {SunEditor.Kernel}` — **only** for constructor params taking the Kernel instance.
    - `@param {SunEditor.Deps}` — everything else: `this.$`, event-callback `$`, module `$`.
    - `@param {SunEditor.FrameContext}` for frame-scoped values.

See [`ARCHITECTURE.md` §5](../ARCHITECTURE.md#5-type-system) for the full type table.

---

## 14. Error handling

- Recoverable failures: log with `console.warn` (prefix: `[SunEditor.<area>.<reason>]`) and return.
- Unrecoverable invariants: `throw new Error('[SUNEDITOR.<area>.<fn>.fail] <reason>')` — see `format.setLine` for the format.
- Public user callbacks are caught by `eventManager.triggerEvent`; plugin hooks and async command calls do not all pass through that wrapper. Inspect the actual caller, propagate or handle failures there, and release resources on error. Do not assume the public-event wrapper catches plugin exceptions.
- No custom logger exists. Don't introduce one.

---

## 15. Code style and feature cost

Use `eslint.config.mjs` as the formatting authority: tabs (width 4), single quotes,
semicolons, trailing commas and 120-column formatting. Match adjacent naming, imports,
JSDoc (`@type` for existing hook contracts) and control-flow style. Avoid unrelated
formatting or renaming. Do not add blanket lint disables or `any` casts to hide a mismatch.

Before implementing a new feature, read the [Performance and Feature Guide](./performance-guide.md).
Find a sibling and shared owner before creating a new API. Keep the inactive path cheap,
preserve synchronous editing decisions and validate costs proportional to the changed path.

---

## Quick checklist

Before saving:

- [ ] All DOM listeners go through `this.$.eventManager.addEvent` / `addGlobalEvent`.
- [ ] Semantic editing APIs reused; any necessary low-level mutation has validation, selection/cache and history ownership (§2).
- [ ] State changes go through `store.set` (no direct field writes).
- [ ] Right state container: `store` vs `context` vs `frameContext` vs `options` vs `frameOptions`.
- [ ] No `instanceof` — use `dom.check.*` or `this.$.instanceCheck.*`.
- [ ] No `window.` / `document.` — use `_w` / `_d` from `helper/env`, or `frameContext.get('_ww'/'_wd')`.
- [ ] Geometry uses the correct frame/coordinate space; horizontal behavior supports RTL without double mirroring (§5).
- [ ] `history.push` called exactly once per logical edit (and never after a wrapper that auto-pushes).
- [ ] `await` on `triggerEvent` and `_callPluginEventAsync`.
- [ ] No L3↔L3 imports; no helper→core imports; no plugin→plugin imports.
- [ ] Plugin has a case-sensitive `static key`, inherits the correct base type, and calls `super(kernel)`.
- [ ] New lang keys added to `src/langs/en.js` only.
- [ ] New private implementation state uses `#private`; existing API contracts preserved.
- [ ] Hot-path costs, resource cleanup and async root/request ownership checked ([performance guide](./performance-guide.md)).
