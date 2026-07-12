# Coding Rules

This document defines the **enforceable coding conventions** for SunEditor source code.
Read this before writing or modifying any `.js` file under `src/`.

- **What this is**: rules about which APIs to call when writing code.
- **What this is not**: file-level edit restrictions (see [`editing-rules.md`](./editing-rules.md)), architecture overview (see [`ARCHITECTURE.md`](../ARCHITECTURE.md)), or commit conventions (see [`guide/commit-types.md`](../guide/commit-types.md)).

For each rule: ✅ canonical pattern, ❌ anti-pattern, 💡 why.
Most violations are caught by `dependency-cruiser` or break at runtime in iframe mode — but not all. Treat this as a checklist, not a suggestion.

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

// Window/document-level listener — must be tracked manually
this.__esc = this.$.eventManager.addGlobalEvent('keydown', this.onEsc);

// Cleanup (only required for addGlobalEvent — addEvent is automatic)
this.__esc &&= this.$.eventManager.removeGlobalEvent(this.__esc);
```

### ❌ DON'T

```javascript
element.addEventListener('click', handler); // not tracked, leaks on destroy
window.addEventListener('keydown', handler); // wrong window in iframe mode
document.addEventListener('selectionchange', handler); // bypasses iframe-aware routing
```

💡 `eventManager.addEvent` records every listener in an internal array and removes them all in `_init()` on destroy/setOptions (`src/core/config/eventManager.js:187-196`). `addGlobalEvent` is iframe-aware: when `iframe` option is on, it registers on the iframe's window too (`eventManager.js:138-148`).

### Public event hooks (`triggerEvent`)

`triggerEvent` calls the user-registered `events.onXxx` handler. It is **async** — always `await`.

```javascript
const result = await this.$.eventManager.triggerEvent('onChange', { frameContext, data });
if (result === false) return; // user canceled
```

❌ Calling without `await` returns a Promise — comparing `Promise === false` is always false, silently dropping user cancels.

---

## 2. DOM mutation — go through `$.html` / `$.format` / `$.inline`

Direct DOM mutation inside the wysiwyg root skips sanitization, history, and char-count. Use the L3 logic layer instead.

### ✅ DO

```javascript
this.$.html.set('<p>new</p>'); // replace, auto history.push(false)
this.$.html.insert('<strong>x</strong>', { selectInserted: true }); // insert at cursor
this.$.html.insertNode(node, { afterNode, skipCharCount: false }); // insert raw node

this.$.format.setLine(pElement); // wrap selection as line
this.$.format.applyBlock(blockquoteEl.cloneNode(false)); // apply block format
this.$.inline.apply(spanFormat, styleArray, true); // apply inline style
```

Wrappers that already push history (do NOT call `history.push` again after these):

| Wrapper                                                              | Auto-pushes      |
| -------------------------------------------------------------------- | ---------------- |
| `$.html.set` / `$.html.insert` / `$.html.insertNode`                 | ✅ `push(false)` |
| `$.format.setLine` / `$.format.applyBlock`                           | ✅               |
| `$.inline.apply`                                                     | ✅               |
| `$.component.insert` / `$.component.select` / `$.component.deselect` | ✅               |

### ❌ DON'T

```javascript
wysiwygFrame.innerHTML = html; // no sanitization, no history, no char-count
container.appendChild(node); // bypasses format normalization
document.execCommand('bold', false); // deprecated, inconsistent across browsers
```

💡 `$.html.set` also handles `rootKey` for multi-root frames (`src/core/logic/dom/html.js:1322-1344`). Skipping it desyncs the history stack for that frame.

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

---

## 6. History & onChange

`history.push(delay, rootKey?)` is what triggers the public `onChange` event.

| Call                                  | Behavior                                                              |
| ------------------------------------- | --------------------------------------------------------------------- |
| `this.$.history.push(false)`          | Debounced save (~400ms), batches rapid edits                          |
| `this.$.history.push(true)`           | Immediate save (use after discrete actions: mouse up, dialog confirm) |
| `this.$.history.push(false, rootKey)` | Multi-root: push to a specific frame                                  |

Rules:

- **Any UI handler that mutates persisted wysiwyg DOM must end its chain with `history.push`.** It's what fires `onChange`.
- If you called a wrapper from §2 that already pushes, **do not push again** — duplicate stack entries break undo.
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

Enforced by `.dependency-cruiser.js`:

| Rule                                                                                  |
| ------------------------------------------------------------------------------------- |
| `helper/*` cannot import from `core/*`, `modules/*`, or `plugins/*`                   |
| `modules/*` cannot import from `core/*` or `plugins/*` — receives `$` via constructor |
| L3 modules cannot import other L3 modules directly — cross-reference via `$`          |
| Plugins cannot import other plugins (same plugin's submodules are fine)               |

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
	static key = 'myPlugin'; // required, lowercase
	static type = 'command'; // required: 'command' | 'dropdown' | 'modal' | 'browser' | 'popup' | 'field' | 'input' | 'dropdown-free'
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

this.figure = new Figure(this, this.$, imgElement, {
	controls: [['mirror_h', 'mirror_v'], ['caption'], ['remove']],
});
```

First arg is the **host plugin instance** (`this`), second is `$`. Order matters — swapping breaks lifecycle hooks.

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

- Every instance field is `#privateField`. No `this._foo`. No public state on `this` unless it's part of the documented plugin API (e.g., `this.title`, `this.icon`, `this.modal`, `this.controller`).
- JSDoc types:
    - `@param {SunEditor.Kernel}` — **only** for constructor params taking the Kernel instance.
    - `@param {SunEditor.Deps}` — everything else: `this.$`, event-callback `$`, module `$`.
    - `@param {SunEditor.FrameContext}` for frame-scoped values.

See [`ARCHITECTURE.md` §5](../ARCHITECTURE.md#5-type-system) for the full type table.

---

## 14. Error handling

- Recoverable failures: log with `console.warn` (prefix: `[SunEditor.<area>.<reason>]`) and return.
- Unrecoverable invariants: `throw new Error('[SUNEDITOR.<area>.<fn>.fail] <reason>')` — see `format.setLine` for the format.
- User event handlers are wrapped in `try/catch` by `eventManager.triggerEvent` and log via `console.error`. Don't swallow exceptions inside plugins; let the wrapper handle it.
- No custom logger exists. Don't introduce one.

---

## Quick checklist

Before saving:

- [ ] All DOM listeners go through `this.$.eventManager.addEvent` / `addGlobalEvent`.
- [ ] All wysiwyg mutations go through `$.html` / `$.format` / `$.inline` (no `innerHTML`, no `appendChild` into wysiwyg).
- [ ] State changes go through `store.set` (no direct field writes).
- [ ] Right state container: `store` vs `context` vs `frameContext` vs `options` vs `frameOptions`.
- [ ] No `instanceof` — use `dom.check.*` or `this.$.instanceCheck.*`.
- [ ] No `window.` / `document.` — use `_w` / `_d` from `helper/env`, or `frameContext.get('_ww'/'_wd')`.
- [ ] `history.push` called exactly once per logical edit (and never after a wrapper that auto-pushes).
- [ ] `await` on `triggerEvent` and `_callPluginEventAsync`.
- [ ] No L3↔L3 imports; no helper→core imports; no plugin→plugin imports.
- [ ] Plugin has `static key`, `static type`, and `super(kernel)` in constructor.
- [ ] New lang keys added to `src/langs/en.js` only.
- [ ] Instance fields are `#private`.
