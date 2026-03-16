# Custom Plugin Guide

Technical reference for creating custom SunEditor plugins. Covers all plugin types, hooks, modules, and patterns for both JavaScript and TypeScript.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Plugin Types](#plugin-types)
- [Static Properties](#static-properties)
- [Constructor Pattern](#constructor-pattern)
- [Dependency Bag (`this.$`)](#dependency-bag-this)
- [Hooks Reference](#hooks-reference)
    - [JSDoc Type Annotations](#jsdoc-type-annotations)
    - [Common Hooks](#common-hooks-all-plugins)
    - [Event Hooks](#event-hooks-all-plugins)
    - [Module Hooks](#module-hooks-contract-interfaces)
    - [Component Hooks](#component-hooks-editorcomponent-interface)
- [Multi-Interface Pattern](#multi-interface-pattern)
    - [`extends` vs `implements`](#extends-vs-implements)
- [Modules Reference](#modules-reference)
- [Complete Examples](#complete-examples)
- [Plugin Registration](#plugin-registration)

---

## Overview

### Architecture

All plugins extend a base class from `src/interfaces/plugins.js`. The inheritance chain:

```
KernelInjector → Base → PluginCommand / PluginModal / PluginDropdown / ...
```

- **`KernelInjector`** — Receives the Kernel and exposes `this.$` (Deps bag — the shared dependency object, not the Kernel itself).
- **`Base`** — Adds common static properties (`key`, `type`, `className`, `options`) and instance properties (`title`, `icon`, `inner`, `beforeItem`, `afterItem`, `replaceButton`).
- **Plugin type class** — Defines required abstract methods per plugin type.

### Key Principles

1. **Class references, not instances** — Register plugin classes in `options.plugins`. The Kernel instantiates them.
2. **Dependency injection** — All editor services are accessed via `this.$` (the Deps bag), never import core modules directly.
3. **Contracts via interfaces** — Plugins can implement multiple contracts (e.g., `ModuleModal`, `EditorComponent`) to hook into module lifecycles.

### Registration Flow

```
options.plugins: [MyPlugin]
       ↓
PluginManager.init()
       ↓
new MyPlugin(kernel, pluginOptions)  →  super(kernel)  →  this.$ = kernel.$ (Deps bag)
       ↓
Toolbar buttons updated (title, icon)
       ↓
Event hooks registered and sorted by priority
       ↓
Component checkers registered (if static component() exists)
```

---

## Quick Start

### JavaScript

```javascript
import { PluginCommand } from 'suneditor/src/interfaces';
import { dom } from 'suneditor/src/helper';

class HelloWorld extends PluginCommand {
	static key = 'helloWorld';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.title = 'Hello World';
		this.icon = '<span style="font-size:14px">HW</span>';
	}

	/**
	 * @override
	 * @type {PluginCommand['action']}
	 */
	action() {
		this.$.html.insert('<p>Hello, World!</p>');
		this.$.history.push(false);
	}
}

export default HelloWorld;
```

### TypeScript

```typescript
import { PluginCommand } from 'suneditor/src/interfaces';
import type { SunEditor } from 'suneditor/types';

class HelloWorld extends PluginCommand {
	static key = 'helloWorld';

	constructor(kernel: SunEditor.Kernel) {
		super(kernel);
		this.title = 'Hello World';
		this.icon = '<span style="font-size:14px">HW</span>';
	}

	action(): void {
		this.$.html.insert('<p>Hello, World!</p>');
		this.$.history.push(false);
	}
}

export default HelloWorld;
```

### Register

```javascript
import SUNEDITOR from 'suneditor';
import plugins from 'suneditor/src/plugins';
import HelloWorld from './plugins/helloWorld';

SUNEDITOR.create('editor', {
	plugins: [...plugins, HelloWorld],
	buttonList: [['bold', 'italic', 'helloWorld']],
});
```

---

## Plugin Types

Source: [`src/interfaces/plugins.js`](../src/interfaces/plugins.js)

| Base Class               | `static type`   | Required Methods    | UI Behavior                                    | Examples                  |
| ------------------------ | --------------- | ------------------- | ---------------------------------------------- | ------------------------- |
| **`PluginCommand`**      | `command`       | `action()`          | Button click executes action                   | blockquote, list_bulleted |
| **`PluginDropdown`**     | `dropdown`      | `action()`          | Button opens menu, item click calls `action()` | align, font, blockStyle   |
| **`PluginDropdownFree`** | `dropdown-free` | —                   | Button opens menu, plugin handles own events   | table, fontColor          |
| **`PluginModal`**        | `modal`         | `open()`            | Button opens modal dialog                      | link, image, video        |
| **`PluginBrowser`**      | `browser`       | `open()`, `close()` | Button opens gallery browser                   | imageGallery              |
| **`PluginField`**        | `field`         | —                   | Responds to editor input events                | mention                   |
| **`PluginInput`**        | `input`         | —                   | Toolbar input element                          | fontSize                  |
| **`PluginPopup`**        | `popup`         | `show()`            | Inline popup context menu                      | anchor                    |

### PluginCommand

Simplest type. Executes immediately on button click.

```javascript
import { PluginCommand } from 'suneditor/src/interfaces';
import { dom } from 'suneditor/src/helper';

class ToggleStrikethrough extends PluginCommand {
	static key = 'toggleStrikethrough';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.title = 'Strikethrough';
		this.icon = 'strikethrough'; // built-in icon key, or raw SVG/HTML
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.Active}
	 */
	active(element, target) {
		if (/^S$/i.test(element?.nodeName)) {
			dom.utils.addClass(target, 'active');
			return true;
		}
		dom.utils.removeClass(target, 'active');
		return false;
	}

	/**
	 * @override
	 * @type {PluginCommand['action']}
	 */
	action() {
		const node = dom.utils.createElement('S');
		this.$.inline.apply(node, { stylesToModify: null, nodesToRemove: null });
	}
}
```

### PluginDropdown

Opens a dropdown menu. `on()` is called when the menu opens, `action()` when an item is clicked.

```javascript
import { PluginDropdown } from 'suneditor/src/interfaces';
import { dom } from 'suneditor/src/helper';

/**
 * @typedef {Object} CustomAlignPluginOptions
 * @property {Array.<"right"|"center"|"left"|"justify">} [items] - Align items
 */

class CustomAlign extends PluginDropdown {
	static key = 'customAlign';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {CustomAlignPluginOptions} pluginOptions
	 */
	constructor(kernel, pluginOptions) {
		super(kernel);
		this.title = this.$.lang.align;
		this.icon = 'align_left';

		// Build dropdown HTML
		const menu = dom.utils.createElement(
			'div',
			{ class: 'se-dropdown se-list-layer' },
			`<div class="se-list-inner">
        <ul class="se-list-basic">
          <li><button type="button" class="se-btn se-btn-list" data-command="left">Left</button></li>
          <li><button type="button" class="se-btn se-btn-list" data-command="center">Center</button></li>
          <li><button type="button" class="se-btn se-btn-list" data-command="right">Right</button></li>
        </ul>
      </div>`,
		);

		// Register dropdown target
		this.$.menu.initDropdownTarget(CustomAlign, menu);
	}

	/**
	 * @override
	 * @type {PluginDropdown['on']}
	 */
	on(target) {
		// Called when dropdown opens. Update active states.
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const value = target.getAttribute('data-command');
		if (!value) return;

		const lines = this.$.format.getLines();
		for (const line of lines) {
			dom.utils.setStyle(line, 'textAlign', value);
		}

		this.$.menu.dropdownOff();
		this.$.focusManager.focus();
		this.$.history.push(false);
	}
}
```

### PluginDropdownFree

Like dropdown, but the plugin handles its own event logic. No automatic `action()` dispatch.

```javascript
import { PluginDropdownFree } from 'suneditor/src/interfaces';

class CustomPicker extends PluginDropdownFree {
  static key = 'customPicker';

  /**
   * @constructor
   * @param {SunEditor.Kernel} kernel - The Kernel instance
   */
  constructor(kernel) {
    super(kernel);
    this.title = 'Custom Picker';
    this.icon = 'color';

    const menu = /* build your custom UI */;
    this.$.menu.initDropdownTarget(CustomPicker, menu);

    // Attach your own event listeners
	this.$.eventManager.addEvent(menu, 'click', this.#handleClick.bind(this));
  }

  on(target) {
    // Called when dropdown opens
  }

  off() {
    // Called when dropdown closes — cleanup state
  }

  #handleClick(e) {
    // Your own event handling logic
    this.$.menu.dropdownOff();
  }
}
```

### PluginModal

Opens a modal dialog. Use with the `Modal` module.

```javascript
import { PluginModal } from 'suneditor/src/interfaces';
import Modal from 'suneditor/src/modules/contract/Modal';
import { dom } from 'suneditor/src/helper';

class InsertCode extends PluginModal {
	static key = 'insertCode';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.title = 'Insert Code';
		this.icon = 'code';

		// Build modal HTML
		const modalEl = dom.utils.createElement(
			'div',
			null,
			`<form>
        <div class="se-modal-header"><button type="button" data-command="close" class="se-btn se-modal-close"></button>
          <span class="se-modal-title">Insert Code</span>
        </div>
        <div class="se-modal-body">
          <textarea class="se-input-form" style="height:200px"></textarea>
        </div>
        <div class="se-modal-footer">
          <button type="submit" class="se-btn-primary"><span>Insert</span></button>
        </div>
      </form>`,
		);

		this.modal = new Modal(this, this.$, modalEl);
		this.textarea = modalEl.querySelector('textarea');
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		this.modal.open();
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Action}
	 */
	async modalAction() {
		const code = this.textarea.value;
		if (!code) return false; // close loading only

		const pre = dom.utils.createElement('PRE');
		const codeEl = dom.utils.createElement('CODE');
		codeEl.textContent = code;
		pre.appendChild(codeEl);

		this.$.html.insert(pre.outerHTML);
		this.$.history.push(false);
		return true; // close modal + loading
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.On}
	 */
	modalOn(isUpdate) {
		if (!isUpdate) this.textarea.value = '';
		this.textarea.focus();
	}

	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Off}
	 */
	modalOff() {
		this.textarea.value = '';
	}
}
```

### PluginBrowser

Opens a gallery/browser interface. Requires `open()` and `close()`.

```javascript
import { PluginBrowser } from 'suneditor/src/interfaces';
import Browser from 'suneditor/src/modules/contract/Browser';

class MyGallery extends PluginBrowser {
	static key = 'myGallery';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.title = 'My Gallery';
		this.icon = 'image';

		this.browser = new Browser(this, this.$ /* browser config */);
	}

	open(onSelectFunction) {
		this.browser.open(onSelectFunction);
	}

	close() {
		this.browser.close();
	}
}
```

### PluginField

Responds to editor input events. Commonly uses `onInput` hook to detect trigger patterns.

```javascript
import { PluginField } from 'suneditor/src/interfaces';
import { converter } from 'suneditor/src/helper';

class HashtagDetector extends PluginField {
	static key = 'hashtagDetector';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.onInput = converter.debounce(this.onInput.bind(this), 200);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnInput}
	 */
	onInput({ frameContext }) {
		const sel = this.$.selection.get();
		const text = sel.anchorNode?.textContent || '';
		const before = text.substring(0, sel.anchorOffset);
		const match = before.match(/#(\w+)$/);

		if (match) {
			// Handle hashtag detection
			console.log('Detected hashtag:', match[1]);
		}
	}
}
```

### PluginInput

Adds an input element to the toolbar instead of a button.

```javascript
import { PluginInput } from 'suneditor/src/interfaces';

class CustomInput extends PluginInput {
	static key = 'customInput';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.title = 'Custom Input';
	}

	/**
	 * @override
	 * @type {PluginInput['toolbarInputKeyDown']}
	 */
	toolbarInputKeyDown({ target, event }) {
		if (event.key === 'Enter') {
			event.preventDefault();
			const value = target.value;
			// Handle the input value
		}
	}

	/**
	 * @override
	 * @type {PluginInput['toolbarInputChange']}
	 */
	toolbarInputChange({ target, value }) {
		// Handle input blur/change
	}
}
```

### PluginPopup

Shows inline popup menus (e.g., for link preview).

```javascript
import { PluginPopup } from 'suneditor/src/interfaces';

class InfoPopup extends PluginPopup {
	static key = 'infoPopup';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.title = 'Info';
	}

	show() {
		// Display popup UI
	}
}
```

---

## Static Properties

Every plugin class can define these static properties:

| Property          | Type       | Required  | Description                                                                                |
| ----------------- | ---------- | --------- | ------------------------------------------------------------------------------------------ |
| `key`             | `string`   | **Yes**   | Unique plugin identifier. Must match the name used in `buttonList`.                        |
| `type`            | `string`   | Inherited | Set by the base class. Do not override.                                                    |
| `className`       | `string`   | No        | CSS class added to the plugin's toolbar button.                                            |
| `options`         | `object`   | No        | Plugin behavior options. See below.                                                        |
| `component(node)` | `function` | No\*      | Static method to detect component DOM nodes. \*Required if implementing `EditorComponent`. |

### `static options`

```javascript
class MyPlugin extends PluginField {
	static options = {
		eventIndex: 100, // Default priority for all event hooks (lower = earlier)
		eventIndex_onKeyDown: 50, // Per-event override
		eventIndex_onInput: 200, // Higher = later execution
		isInputComponent: true, // Allow keyboard input inside component (e.g., table cells)
	};
}
```

### `static component(node)`

Required for plugins implementing the `EditorComponent` contract. Returns the component element if the node belongs to this plugin, or `null` otherwise.

```javascript
class MyImagePlugin extends PluginModal {
	static component(node) {
		return /^IMG$/i.test(node?.nodeName) ? node : null;
	}
}
```

---

## Constructor Pattern

Plugin options are defined as a `@typedef` above the class, and the constructor receives `kernel` (Kernel instance) + `pluginOptions`:

```javascript
/**
 * @typedef {Object} MyPluginOptions
 * @property {boolean} [canResize=true] - Whether the element can be resized.
 * @property {string} [defaultWidth="auto"] - The default width.
 */

/**
 * @class
 * @description MyPlugin description.
 */
class MyPlugin extends PluginModal {
	static key = 'myPlugin';
	static className = 'se-btn-my-plugin';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {MyPluginOptions} pluginOptions
	 */
	constructor(kernel, pluginOptions) {
		super(kernel); // KernelInjector → this.$ = kernel.$ (Deps bag)

		// Plugin metadata (used by toolbar button)
		this.title = this.$.lang.myPlugin || 'My Plugin';
		this.icon = 'myPlugin'; // icon key from this.$.icons, or raw HTML/SVG

		// Optional: toolbar button content and layout
		this.inner = null; // string (HTML) | HTMLElement | false (hide) | null (use icon)
		this.beforeItem = null; // HTMLElement to insert before the button
		this.afterItem = null; // HTMLElement to insert after the button
		this.replaceButton = null; // HTMLElement to replace the entire default button

		// Plugin members
		this.myState = {};

		// Module instances (if using Modal, Controller, etc.)
		this.modal = new Modal(this, this.$, modalElement);
		this.controller = new Controller(this, this.$, controllerElement, { position: 'bottom' });
	}
}
```

**Parameters:**

- `kernel` (`SunEditor.Kernel`) — The Kernel instance (runtime container). Pass to `super()` to inject `this.$` (Deps bag).
- `pluginOptions` (`object`) — Plugin-specific options from `options[pluginKey]`. Define a `@typedef` for type checking.

---

## Dependency Bag (`this.$`)

All plugins access editor services through `this.$` (the Deps bag). This shared dependency object is built once by the Kernel (`CoreKernel`) and provided to all consumers. **`$` is not the Kernel itself** — it is the dependency context that the Kernel provides.

Source: [`src/core/kernel/kernelInjector.js`](../src/core/kernel/kernelInjector.js)

### Config

| Property       | Type     | Description                                                 |
| -------------- | -------- | ----------------------------------------------------------- |
| `options`      | `Map`    | Global editor options (shared across all frames)            |
| `frameOptions` | `Map`    | Current frame's options (width, height, placeholder, etc.)  |
| `context`      | `Map`    | Global context (toolbar, statusbar, modal overlay elements) |
| `frameContext` | `Map`    | Current frame context (wysiwyg, code, readonly state, etc.) |
| `frameRoots`   | `Map`    | All frame contexts keyed by rootKey                         |
| `lang`         | `object` | Language strings (e.g., `this.$.lang.image`)                |
| `icons`        | `object` | Icon HTML strings (e.g., `this.$.icons.bold`)               |

### DOM Logic

| Property        | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `selection`     | Selection and range manipulation                           |
| `html`          | HTML get/set, insert, sanitization                         |
| `format`        | Block-level formatting (applyBlock, removeBlock, getLines) |
| `inline`        | Inline formatting (bold, italic, styles)                   |
| `listFormat`    | List operations (create, edit, nested)                     |
| `nodeTransform` | DOM node transformations                                   |
| `char`          | Character counting and limits                              |
| `offset`        | Position calculations                                      |

### Shell Logic

| Property            | Description                                         |
| ------------------- | --------------------------------------------------- |
| `component`         | Component lifecycle (select, deselect, setInfo)     |
| `focusManager`      | Focus/blur management                               |
| `pluginManager`     | Plugin registry and lifecycle                       |
| `plugins`           | Plugin instances map (e.g., `this.$.plugins.image`) |
| `ui`                | UI state (loading, alerts, toast, theme)            |
| `commandDispatcher` | Command routing and execution                       |
| `history`           | Undo/redo stack (`push`, `undo`, `redo`)            |
| `shortcuts`         | Keyboard shortcut mapping                           |

### Panel Logic

| Property     | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `toolbar`    | Main toolbar renderer and positioning                          |
| `subToolbar` | Sub-toolbar (only with `_subMode`)                             |
| `menu`       | Dropdown menu management (`initDropdownTarget`, `dropdownOff`) |
| `viewer`     | View modes (code view, fullscreen, preview)                    |

### Services

| Property          | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `eventManager`    | Public event API (`addEvent`, `removeEvent`, `triggerEvent`) |
| `contextProvider` | Context/FrameContext Map management                          |
| `optionProvider`  | Options/FrameOptions Map management                          |
| `instanceCheck`   | Iframe-safe `instanceof` checks                              |
| `store`           | Central runtime state store                                  |
| `facade`          | The editor public API instance                               |

---

## Hooks Reference

Hooks are methods that the editor core or modules call on plugin instances at specific lifecycle points.

### JSDoc Type Annotations

All hook methods should be annotated with JSDoc tags to enable type checking and IDE support. There are three annotation patterns:

#### `@hook` + `@type` — Hook Methods

Used for methods called by the editor core or modules. The `@hook` tag indicates which system calls the method, and `@type` provides the type signature.

```javascript
/**
 * @hook Editor.EventManager
 * @type {SunEditor.Hook.Event.Active}
 */
active(element, target) { ... }

/**
 * @hook Editor.EventManager
 * @type {SunEditor.Hook.Event.OnKeyDown}
 */
onKeyDown({ frameContext, event, range, line }) { ... }

/**
 * @hook Editor.Core
 * @type {SunEditor.Hook.Core.Shortcut}
 */
shortcut({ range, info }) { ... }

/**
 * @hook Modules.Modal
 * @type {SunEditor.Hook.Modal.Action}
 */
async modalAction() { ... }

/**
 * @hook Editor.Component
 * @type {SunEditor.Hook.Component.Select}
 */
componentSelect(target) { ... }
```

**Available `@hook` categories and their `@type` namespaces:**

| `@hook` Category      | `@type` Namespace              | Methods                                                                         |
| --------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `Editor.EventManager` | `SunEditor.Hook.Event.*`       | `Active`, `OnKeyDown`, `OnInput`, `OnClick`, `OnPaste`, `OnFocus`, `OnBlur` ... |
| `Editor.Core`         | `SunEditor.Hook.Core.*`        | `RetainFormat`, `Shortcut`, `SetDir`, `Init`                                    |
| `Editor.Component`    | `SunEditor.Hook.Component.*`   | `Select`, `Deselect`, `Edit`, `Destroy`, `Copy`                                 |
| `Modules.Modal`       | `SunEditor.Hook.Modal.*`       | `Action`, `On`, `Init`, `Off`, `Resize`                                         |
| `Modules.Controller`  | `SunEditor.Hook.Controller.*`  | `Action`, `On`, `Close`                                                         |
| `Modules.ColorPicker` | `SunEditor.Hook.ColorPicker.*` | `Action`, `HueSliderOpen`, `HueSliderClose`                                     |
| `Modules.HueSlider`   | `SunEditor.Hook.HueSlider.*`   | `Action`, `CancelAction`                                                        |

#### `@override` + `@type` — Base Class Method Overrides

Used when overriding required/optional methods from the base plugin class:

```javascript
/**
 * @override
 * @type {PluginModal['open']}
 */
open(target) { ... }

/**
 * @override
 * @type {PluginInput['toolbarInputKeyDown']}
 */
toolbarInputKeyDown({ target, event }) { ... }
```

#### `@imple` + `@type` — Cross-Plugin Interface Methods

Used when a plugin implements methods from **another plugin type** via `@implements` (see [`extends` vs `implements`](#extends-vs-implements)):

```javascript
/**
 * @imple Command
 * @type {PluginCommand['action']}
 */
action(target) { ... }

/**
 * @imple Dropdown
 * @type {PluginDropdown['on']}
 */
on(target) { ... }
```

---

### Common Hooks (All Plugins)

Source: [`src/hooks/base.js`](../src/hooks/base.js) — `Core` object

These can be implemented by **any** plugin type.

| Hook                      | When Called                  | Return                 | Description                                                                                                              |
| ------------------------- | ---------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `active(element, target)` | Cursor position changes      | `boolean \| undefined` | Update toolbar button active state. Return `true` if active, `false` if not, `undefined` to stop calling for this scope. |
| `init()`                  | Editor init / `resetOptions` | `void`                 | Re-initialize plugin state.                                                                                              |
| `retainFormat()`          | HTML cleaning/validation     | `{query, method}`      | Return a CSS selector `query` and a `method(element)` to validate/preserve component format.                             |
| `shortcut(params)`        | Shortcut key triggered       | `void`                 | Handle custom keyboard shortcuts. Params: `{ range, line, info, event, keyCode, $ }`                                     |
| `setDir(dir)`             | RTL/LTR direction change     | `void`                 | Adjust plugin UI for direction change. `dir` is `'rtl'` or `'ltr'`.                                                      |

**`active()` example:**

```javascript
/**
 * @hook Editor.EventManager
 * @type {SunEditor.Hook.Event.Active}
 */
active(element, target) {
  if (/^BLOCKQUOTE$/i.test(element?.nodeName)) {
    dom.utils.addClass(target, 'active');
    return true;
  }
  dom.utils.removeClass(target, 'active');
  return false;
}
```

### Event Hooks (All Plugins)

Source: [`src/hooks/base.js`](../src/hooks/base.js) — `Event` object

Any plugin can implement event hooks. Method names use the lowercase `on` prefix.

**Interruptible Events** — Returning a `boolean` stops the event hook loop:

- `false` — Stops remaining plugins **and** prevents default editor behavior
- `true` — Stops remaining plugins, **allows** default editor behavior
- `void` / `undefined` — Continues to next plugin

| Hook                 | Interruptible | Params Type                | Description             |
| -------------------- | ------------- | -------------------------- | ----------------------- |
| `onKeyDown`          | Yes           | `HookParams.KeyEvent`      | Key down in editor      |
| `onKeyUp`            | Yes           | `HookParams.KeyEvent`      | Key up in editor        |
| `onMouseDown`        | Yes           | `HookParams.MouseEvent`    | Mouse down in editor    |
| `onClick`            | Yes           | `HookParams.MouseEvent`    | Click in editor         |
| `onPaste`            | Yes           | `HookParams.Paste`         | Paste event             |
| `onBeforeInput`      | No            | `HookParams.InputWithData` | Before input processing |
| `onInput`            | No            | `HookParams.InputWithData` | After input processing  |
| `onMouseUp`          | No            | `HookParams.MouseEvent`    | Mouse up in editor      |
| `onMouseMove`        | No            | `HookParams.MouseEvent`    | Mouse move in editor    |
| `onMouseLeave`       | No            | `HookParams.MouseEvent`    | Mouse leave editor      |
| `onScroll`           | No            | `HookParams.Scroll`        | Editor scroll           |
| `onFocus`            | No            | `HookParams.FocusBlur`     | Editor focus            |
| `onBlur`             | No            | `HookParams.FocusBlur`     | Editor blur             |
| `onFilePasteAndDrop` | No            | `HookParams.FilePasteDrop` | File paste/drop         |

**Parameter Types** (from [`src/hooks/params.js`](../src/hooks/params.js)):

| Type                       | Properties                                 |
| -------------------------- | ------------------------------------------ |
| `HookParams.MouseEvent`    | `{ frameContext, event }`                  |
| `HookParams.KeyEvent`      | `{ frameContext, event, range, line }`     |
| `HookParams.FocusBlur`     | `{ frameContext, event }`                  |
| `HookParams.Scroll`        | `{ frameContext, event }`                  |
| `HookParams.InputWithData` | `{ frameContext, event, data }`            |
| `HookParams.Paste`         | `{ frameContext, event, data, doc }`       |
| `HookParams.FilePasteDrop` | `{ frameContext, event, file }`            |
| `HookParams.Shortcut`      | `{ range, line, info, event, keyCode, $ }` |
| `HookParams.CopyComponent` | `{ event, cloneContainer, info }`          |

**Async variants:** Every event hook can be `async`. The PluginManager calls both sync and async versions.

**Execution priority:**

```javascript
class MyPlugin extends PluginField {
	static options = {
		eventIndex: 100, // Default priority (lower = earlier)
		eventIndex_onKeyDown: 50, // Override: run onKeyDown earlier
		eventIndex_onInput: 200, // Override: run onInput later
	};

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnKeyDown}
	 */
	onKeyDown({ event, range }) {
		if (event.key === 'Tab') {
			event.preventDefault();
			this.$.html.insert('    ');
			return false; // Stop further processing
		}
	}
}
```

### Module Hooks (Contract Interfaces)

Source: [`src/interfaces/contracts.js`](../src/interfaces/contracts.js)

When a plugin uses a module (Modal, Controller, etc.), it implements the corresponding contract interface to receive callbacks.

#### ModuleModal

For plugins using the `Modal` module.

| Hook                 | Required | When Called               | Return                                                                                                         |
| -------------------- | -------- | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `modalAction()`      | **Yes**  | Form submit               | `Promise<boolean>` — `true`: close modal + loading, `false`: close loading only, `undefined`: close modal only |
| `modalOn(isUpdate)`  | No       | After modal opens         | `void` — `isUpdate`: editing existing (`true`) vs creating new (`false`)                                       |
| `modalInit()`        | No       | Before modal opens/closes | `void`                                                                                                         |
| `modalOff(isUpdate)` | No       | After modal closes        | `void`                                                                                                         |
| `modalResize()`      | No       | Modal window resized      | `void`                                                                                                         |

#### ModuleController

For plugins using the `Controller` module (floating toolbar).

| Hook                         | Required | When Called               | Return                                        |
| ---------------------------- | -------- | ------------------------- | --------------------------------------------- |
| `controllerAction(target)`   | **Yes**  | Controller button clicked | `void` — `target`: the clicked button element |
| `controllerOn(form, target)` | No       | After controller opens    | `void`                                        |
| `controllerClose()`          | No       | Before controller closes  | `void`                                        |

#### ModuleColorPicker

For plugins using the `ColorPicker` module.

| Hook                          | Required | When Called          | Return |
| ----------------------------- | -------- | -------------------- | ------ |
| `colorPickerAction(color)`    | No       | Color selected       | `void` |
| `colorPickerHueSliderOpen()`  | No       | Hue slider opened    | `void` |
| `colorPickerHueSliderClose()` | No       | Hue slider cancelled | `void` |

#### ModuleHueSlider

For plugins using the `HueSlider` module.

| Hook                      | Required | When Called              | Return |
| ------------------------- | -------- | ------------------------ | ------ |
| `hueSliderAction()`       | **Yes**  | Color selected in slider | `void` |
| `hueSliderCancelAction()` | No       | Hue slider cancelled     | `void` |

#### ModuleBrowser

For plugins using the `Browser` module.

| Hook            | Required | When Called    | Return |
| --------------- | -------- | -------------- | ------ |
| `browserInit()` | No       | Browser opened | `void` |

### Component Hooks (`EditorComponent` Interface)

Source: [`src/interfaces/contracts.js`](../src/interfaces/contracts.js)

For plugins that create **static components** in the editor (e.g., images, videos, tables, embeds).

**Requirements:**

1. Define `static component(node)` — Returns the component element if the node belongs to this plugin, or `null`.
2. Define a public `_element` property — References the currently controlled DOM element. Used to detect clicks and prevent accidental controller closure.

| Hook                        | Required | When Called                   | Return                                                              |
| --------------------------- | -------- | ----------------------------- | ------------------------------------------------------------------- |
| `componentSelect(target)`   | **Yes**  | Component selected (clicked)  | `void \| boolean` — Return `true` for special non-figure components |
| `componentDeselect(target)` | No       | Component deselected          | `void`                                                              |
| `componentEdit(target)`     | No       | Component edit button clicked | `void`                                                              |
| `componentDestroy(target)`  | No       | Component deleted             | `Promise<void>`                                                     |
| `componentCopy(params)`     | No       | Component copy requested      | `boolean \| void` — Return `false` to cancel copy                   |

**Component detection flow:**

```
User clicks element in editor
       ↓
PluginManager.findComponentInfo(element)
       ↓
Calls each plugin's static component(node) method
       ↓
First non-null result wins → { target, pluginName, options }
       ↓
plugin.componentSelect(target) called
```

---

## Multi-Interface Pattern

A single plugin can combine a base type with multiple contract interfaces. This is useful for plugins that need a modal dialog, a floating controller, and component lifecycle management.

### TypeScript

Use `implements` to compose interfaces:

```typescript
import { interfaces } from 'suneditor';
import type { SunEditor } from 'suneditor/types';
import Modal from 'suneditor/src/modules/contract/Modal';
import Controller from 'suneditor/src/modules/contract/Controller';

class CustomEmbed extends interfaces.PluginModal
  implements interfaces.ModuleModal, interfaces.ModuleController, interfaces.EditorComponent
{
  static key = 'customEmbed';

  _element: HTMLElement | null = null;

  modal: InstanceType<typeof Modal>;
  controller: InstanceType<typeof Controller>;

  constructor(kernel: SunEditor.Kernel) {
    super(kernel);
    this.title = 'Custom Embed';
    this.icon = 'embed';

    const modalEl = /* build modal HTML */;
    const controllerEl = /* build controller HTML */;

    this.modal = new Modal(this, this.$, modalEl);
    this.controller = new Controller(this, this.$, controllerEl);
  }

  // Static: detect embed components
  static component(node: Node): Node | null {
    return /^IFRAME$/i.test(node?.nodeName) ? node : null;
  }

  /** @override PluginModal */
  open(target?: HTMLElement): void {
    this.modal.open();
  }

  /** @hook Modules.Modal — Action */
  async modalAction(): Promise<boolean> {
    // Handle form submission
    this.$.history.push(false);
    return true;
  }

  /** @hook Modules.Modal — On */
  modalOn(isUpdate: boolean): void {
    // Initialize modal state
  }

  /** @hook Modules.Modal — Off */
  modalOff(isUpdate: boolean): void {
    // Cleanup
  }

  /** @hook Modules.Controller — Action */
  controllerAction(target: HTMLElement): void {
    const command = target.getAttribute('data-command');
    if (command === 'edit') this.modal.open();
    if (command === 'delete') this.componentDestroy(this._element!);
  }

  /** @hook Modules.Controller — Close */
  controllerClose(): void {
    // Cleanup on controller close
  }

  /** @hook Editor.Component — Select */
  componentSelect(target: HTMLElement): void {
    this._element = target;
    this.controller.open(target, null, { isWWTarget: false });
  }

  /** @hook Editor.Component — Deselect */
  componentDeselect(target: HTMLElement): void {
    this._element = null;
  }

  /** @hook Editor.Component — Destroy */
  async componentDestroy(target: HTMLElement): Promise<void> {
    const container = target.parentElement;
    container?.remove();
    this._element = null;
    this.$.focusManager.focus();
    this.$.history.push(false);
  }
}
```

### JavaScript

In JavaScript, simply implement the methods — no `implements` keyword needed. The editor calls methods by name regardless of declared interfaces.

```javascript
import { PluginModal } from 'suneditor/src/interfaces';
import Modal from 'suneditor/src/modules/contract/Modal';
import Controller from 'suneditor/src/modules/contract/Controller';

class CustomEmbed extends PluginModal {
	static key = 'customEmbed';

	static component(node) {
		return /^IFRAME$/i.test(node?.nodeName) ? node : null;
	}

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this._element = null;
		this.modal = new Modal(this, this.$, modalEl);
		this.controller = new Controller(this, this.$, controllerEl);
	}

	/**
	 * @override
	 * @type {PluginModal['open']}
	 */
	open() {
		this.modal.open();
	}
	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Action}
	 */
	async modalAction() {
		/* ... */ return true;
	}
	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.On}
	 */
	modalOn(isUpdate) {
		/* ... */
	}
	/**
	 * @hook Modules.Modal
	 * @type {SunEditor.Hook.Modal.Off}
	 */
	modalOff(isUpdate) {
		/* ... */
	}
	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		/* ... */
	}
	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 */
	componentSelect(target) {
		this._element = target;
	}
	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Deselect}
	 */
	componentDeselect(target) {
		this._element = null;
	}
	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Destroy}
	 */
	async componentDestroy(target) {
		/* ... */
	}
}
```

> **Key insight:** TypeScript `implements` only provides compile-time type checking — it enforces that you implement all required methods with correct signatures. At runtime, the behavior is identical to JavaScript.

### `extends` vs `implements`

A plugin uses **`extends`** and **`implements`** for different purposes:

| Keyword          | Purpose                                                                | Multiplicity     |
| ---------------- | ---------------------------------------------------------------------- | ---------------- |
| **`extends`**    | Inherit from a plugin base class (determines the plugin type)          | Exactly **one**  |
| **`implements`** | Compose additional interfaces (module contracts or other plugin types) | **Zero or more** |

#### 1. `extends` — Plugin Base Type (single inheritance)

Every plugin `extends` exactly **one** base class. This determines its primary type and lifecycle:

```
extends PluginModal    → type: 'modal'    (required: open())
extends PluginCommand  → type: 'command'  (required: action())
extends PluginInput    → type: 'input'    (optional: toolbarInputKeyDown/Change)
extends PluginDropdown → type: 'dropdown' (required: action())
```

#### 2. `implements` — Module Contracts

Plugins `implements` module contracts to hook into module lifecycles:

```typescript
class Image extends PluginModal
  implements ModuleModal, ModuleController, EditorComponent { ... }
```

- `ModuleModal` → `modalAction()`, `modalOn()`, `modalOff()`
- `ModuleController` → `controllerAction()`, `controllerOn()`
- `EditorComponent` → `componentSelect()`, `componentDestroy()`

#### 3. `implements` — Cross-Plugin-Type Composition

A plugin can also `implements` **other plugin type interfaces** to provide multiple interaction modes. The `fontSize` plugin is a representative example:

```
FontSize extends PluginInput          ← base type (toolbar input)
  @implements {PluginCommand}         ← provides action() for inc/dec buttons
  @implements {PluginDropdown}        ← provides on() for dropdown menu
```

**JavaScript** — Use `@implements` JSDoc tags for type hints:

```javascript
import { PluginCommand, PluginDropdown, PluginInput } from 'suneditor/src/interfaces';

void PluginCommand;
void PluginDropdown;

/**
 * @implements {PluginCommand}
 * @implements {PluginDropdown}
 */
class FontSize extends PluginInput {
	static key = 'fontSize';

	// PluginInput base
	toolbarInputKeyDown(params) {
		/* handle arrow keys, enter */
	}
	toolbarInputChange(params) {
		/* apply typed value */
	}

	// PluginCommand (implements) — inc/dec button clicks
	action(target) {
		/* adjust font size */
	}

	// PluginDropdown (implements) — dropdown open
	on(target) {
		/* highlight active size in list */
	}
}
```

**TypeScript** — Use `implements` keyword:

```typescript
import { interfaces } from 'suneditor';
import type { SunEditor } from 'suneditor/types';

class FontSize extends interfaces.PluginInput
  implements interfaces.PluginCommand, interfaces.PluginDropdown
{
  static key = 'fontSize';

  toolbarInputKeyDown(params: SunEditor.HookParams.ToolbarInputKeyDown): void { ... }
  toolbarInputChange(params: SunEditor.HookParams.ToolbarInputChange): void { ... }
  action(target: HTMLElement): void { ... }
  on(target: HTMLElement): void { ... }
}
```

> **When to use cross-plugin implements:** When a single plugin provides **multiple interaction modes** (e.g., an input field + dropdown menu + command buttons all controlling the same feature). The base `extends` determines the primary type; `implements` adds methods from other plugin types that the editor calls by name.

---

## Modules Reference

Source: [`src/modules/`](../src/modules/)

Modules are UI components that plugins instantiate manually. They are **not** auto-registered.

| Module              | Import Path                    | Constructor                                  | Purpose                             |
| ------------------- | ------------------------------ | -------------------------------------------- | ----------------------------------- |
| `Modal`             | `modules/contract/Modal`       | `new Modal(inst, $, element)`                | Dialog windows                      |
| `Controller`        | `modules/contract/Controller`  | `new Controller(inst, $, element, options?)` | Floating tooltip controllers        |
| `Figure`            | `modules/contract/Figure`      | `new Figure(inst, $, controls, options?)`    | Resize/align wrapper for components |
| `ColorPicker`       | `modules/contract/ColorPicker` | `new ColorPicker(inst, $, ...)`              | Color palette UI                    |
| `HueSlider`         | `modules/contract/HueSlider`   | `new HueSlider(inst, $, ...)`                | HSL color wheel                     |
| `Browser`           | `modules/contract/Browser`     | `new Browser(inst, $, ...)`                  | Gallery/file browser UI             |
| `FileManager`       | `modules/manager/FileManager`  | `new FileManager(inst, $, options)`          | File upload management              |
| `ApiManager`        | `modules/manager/ApiManager`   | `new ApiManager(inst, $, ...)`               | XHR/fetch request management        |
| `SelectMenu`        | `modules/ui/SelectMenu`        | `new SelectMenu(...)`                        | Custom dropdown select menus        |
| `ModalAnchorEditor` | `modules/ui/ModalAnchorEditor` | `new ModalAnchorEditor($, modal, options)`   | Link/anchor editing form            |

**Constructor pattern:** All contract modules receive:

1. `inst` — The plugin instance (for calling hook methods back on the plugin)
2. `$` — The deps bag
3. Module-specific parameters (HTML element, options, etc.)

---

## Complete Examples

### Example 1: Word Count Command (JavaScript)

A command plugin that shows the current word count.

```javascript
import { PluginCommand } from 'suneditor/src/interfaces';

class WordCount extends PluginCommand {
	static key = 'wordCount';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.title = 'Word Count';
		this.icon = '<span style="font-size:12px;font-weight:bold">WC</span>';
	}

	/**
	 * @override
	 * @type {PluginCommand['action']}
	 */
	action() {
		const text = this.$.html.get({ format: 'text' });
		const words = text.trim().split(/\s+/).filter(Boolean).length;
		this.$.ui.showToast(`Words: ${words}`, 2000);
	}
}

export default WordCount;
```

### Example 2: Custom Block Style Dropdown (JavaScript)

A dropdown plugin that applies predefined block styles.

```javascript
import { PluginDropdown } from 'suneditor/src/interfaces';
import { dom } from 'suneditor/src/helper';

class QuickStyle extends PluginDropdown {
	static key = 'quickStyle';

	#styles = [
		{ name: 'Note', class: 'note-block', bg: '#e8f5e9' },
		{ name: 'Warning', class: 'warning-block', bg: '#fff3e0' },
		{ name: 'Info', class: 'info-block', bg: '#e3f2fd' },
	];

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel) {
		super(kernel);
		this.title = 'Quick Style';
		this.icon = 'blockStyle';

		let html = '';
		for (const style of this.#styles) {
			html += `<li><button type="button" class="se-btn se-btn-list" data-command="${style.class}"
        style="background:${style.bg};padding:4px 8px">${style.name}</button></li>`;
		}

		const menu = dom.utils.createElement('div', { class: 'se-dropdown se-list-layer' }, `<div class="se-list-inner"><ul class="se-list-basic">${html}</ul></div>`);

		this.$.menu.initDropdownTarget(QuickStyle, menu);
	}

	/**
	 * @override
	 * @type {PluginDropdown['action']}
	 */
	action(target) {
		const className = target.getAttribute('data-command');
		if (!className) return;

		const lines = this.$.format.getLines();
		for (const line of lines) {
			dom.utils.toggleClass(line, className);
		}

		this.$.menu.dropdownOff();
		this.$.focusManager.focus();
		this.$.history.push(false);
	}
}

export default QuickStyle;
```

### Example 3: Custom Embed Modal with Controller (TypeScript)

A modal plugin with a controller for editing embedded iframes.

```typescript
import { interfaces } from 'suneditor';
import type { SunEditor } from 'suneditor/types';
import Modal from 'suneditor/src/modules/contract/Modal';
import Controller from 'suneditor/src/modules/contract/Controller';
import { dom } from 'suneditor/src/helper';

class Embed extends interfaces.PluginModal implements interfaces.ModuleModal, interfaces.ModuleController, interfaces.EditorComponent {
	static key = 'embed';

	_element: HTMLIFrameElement | null = null;
	#isUpdate = false;

	modal: InstanceType<typeof Modal>;
	controller: InstanceType<typeof Controller>;
	urlInput: HTMLInputElement;

	static component(node: Node): Node | null {
		const el = dom.check.isFigure(node) ? (node as HTMLElement).firstElementChild : node;
		return /^IFRAME$/i.test(el?.nodeName ?? '') ? el : null;
	}

	constructor(kernel: SunEditor.Kernel) {
		super(kernel);
		this.title = 'Embed';
		this.icon = 'embed';

		// Modal HTML
		const modalEl = dom.utils.createElement(
			'div',
			null,
			`<form>
        <div class="se-modal-header">
          <button type="button" data-command="close" class="se-btn se-modal-close"></button>
          <span class="se-modal-title">Embed URL</span>
        </div>
        <div class="se-modal-body">
          <label>URL</label>
          <input class="se-input-form" type="url" placeholder="https://..." />
        </div>
        <div class="se-modal-footer">
          <button type="submit" class="se-btn-primary"><span>Insert</span></button>
        </div>
      </form>`,
		);

		// Controller HTML
		const controllerEl = dom.utils.createElement(
			'div',
			{ class: 'se-controller' },
			`<div>
        <button type="button" data-command="edit" class="se-btn" title="Edit">Edit</button>
        <button type="button" data-command="delete" class="se-btn" title="Delete">Delete</button>
      </div>`,
		);

		this.modal = new Modal(this, this.$, modalEl);
		this.controller = new Controller(this, this.$, controllerEl);
		this.urlInput = modalEl.querySelector('input')!;
	}

	/** @override PluginModal */
	open(): void {
		this.modal.open();
	}

	/** @hook Modules.Modal — Action */
	async modalAction(): Promise<boolean> {
		const url = this.urlInput.value.trim();
		if (!url) return false;

		if (this.#isUpdate && this._element) {
			this._element.src = url;
		} else {
			const iframe = dom.utils.createElement('IFRAME', {
				src: url,
				width: '560',
				height: '315',
				frameborder: '0',
				allowfullscreen: 'true',
			}) as HTMLIFrameElement;
			this.$.html.insert(iframe.outerHTML);
		}

		this.$.history.push(false);
		return true;
	}

	/** @hook Modules.Modal — On */
	modalOn(isUpdate: boolean): void {
		this.#isUpdate = isUpdate;
		this.urlInput.value = isUpdate && this._element ? this._element.src : '';
		this.urlInput.focus();
	}

	/** @hook Modules.Modal — Init */
	modalInit(): void {
		this.controller.close();
	}

	/** @hook Modules.Modal — Off */
	modalOff(): void {
		this.urlInput.value = '';
	}

	/** @hook Modules.Controller — Action */
	controllerAction(target: HTMLElement): void {
		const command = target.getAttribute('data-command');
		if (command === 'edit') {
			this.modal.open();
		} else if (command === 'delete') {
			this.componentDestroy(this._element!);
		}
	}

	/** @hook Editor.Component — Select */
	componentSelect(target: HTMLElement): void {
		this._element = target as HTMLIFrameElement;
		this.controller.open(target, null, { isWWTarget: false });
	}

	/** @hook Editor.Component — Deselect */
	componentDeselect(): void {
		this._element = null;
	}

	/** @hook Editor.Component — Destroy */
	async componentDestroy(target: HTMLElement): Promise<void> {
		const container = dom.query.getParentElement(target, dom.check.isFigure) || target;
		const focusEl = container.previousElementSibling || container.nextElementSibling;
		dom.utils.removeItem(container);
		this._element = null;
		this.$.focusManager.focusEdge(focusEl);
		this.$.history.push(false);
	}
}

export default Embed;
```

---

## Plugin Registration

### Options Format

Plugins are registered as class references in `options.plugins`:

```javascript
import SUNEDITOR from 'suneditor';
import plugins from 'suneditor/src/plugins';
import MyPlugin from './plugins/myPlugin';
import AnotherPlugin from './plugins/anotherPlugin';

// Array format (recommended)
SUNEDITOR.create('editor', {
	plugins: [...plugins, MyPlugin, AnotherPlugin],
	buttonList: [['bold', 'italic', 'myPlugin', 'anotherPlugin']],
});

// Object format
SUNEDITOR.create('editor', {
	plugins: { ...plugins, myPlugin: MyPlugin, anotherPlugin: AnotherPlugin },
	buttonList: [['bold', 'italic', 'myPlugin', 'anotherPlugin']],
});
```

### Plugin Options

Pass plugin-specific options via `options[pluginKey]`:

```javascript
SUNEDITOR.create('editor', {
	plugins: [MyPlugin],
	buttonList: [['myPlugin']],
	myPlugin: {
		maxItems: 10,
		apiUrl: '/api/data',
	},
});
```

These options are passed as the second argument to the constructor: `constructor(kernel, pluginOptions)`.

### Registration Rules

1. **Always pass class references** — The kernel manages instantiation and lifecycle.

    ```javascript
    // Correct
    plugins: [MyPlugin];

    // Wrong — kernel cannot manage lifecycle
    plugins: [new MyPlugin()];
    ```

2. **`static key` must match `buttonList` name** — The toolbar maps button names to plugin keys.

3. **Plugins without toolbar buttons** — `PluginField` plugins (like `mention`) don't need to appear in `buttonList`. They are registered and respond to editor events automatically.

---

## Built-in Reference Implementations

For studying real-world implementations:

| Plugin     | Type                                  | Complexity | File                                  |
| ---------- | ------------------------------------- | ---------- | ------------------------------------- |
| Blockquote | Command                               | Simple     | `src/plugins/command/blockquote.js`   |
| Align      | Dropdown                              | Simple     | `src/plugins/dropdown/align.js`       |
| Font       | Dropdown                              | Medium     | `src/plugins/dropdown/font.js`        |
| Link       | Modal + Controller                    | Medium     | `src/plugins/modal/link.js`           |
| Image      | Modal + Component + FileManager       | Complex    | `src/plugins/modal/image/index.js`    |
| Video      | Modal + Component + FileManager       | Complex    | `src/plugins/modal/video/index.js`    |
| Table      | DropdownFree + Component + Controller | Complex    | `src/plugins/dropdown/table/index.js` |
| Mention    | Field                                 | Medium     | `src/plugins/field/mention.js`        |
| FontSize   | Input                                 | Simple     | `src/plugins/input/fontSize.js`       |
