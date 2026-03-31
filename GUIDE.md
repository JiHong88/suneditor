# GUIDE.md

> **Purpose:**
> Technical reference for developers and AI agents.
> Defines architecture, conventions, and development workflow.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Directory Structure](#directory-structure)
- [Technical Requirements](#technical-requirements)
- [Architecture](#architecture) (overview) | [ARCHITECTURE.md](./ARCHITECTURE.md) (deep dive)
- [Plugin System](#plugin-system-srcplugins)
- [Modules](#modules-srcmodules)
- [Essential Commands](#essential-commands)
- [Testing Strategy](#testing-strategy)
- [Markdown View](#markdown-view)
- [Code Language Selector](#code-language-selector)
- Supplementary Guides
    - [External Libraries](./guide/external-libraries.md) - CodeMirror, KaTeX, MathJax
    - [Changes Guide](./guide/changes-guide.md) - changes.md 작성 규칙 및 릴리즈 활용법

---

## Project Overview

SunEditor is a WYSIWYG editor written in pure vanilla JavaScript (ES2022+) with no runtime dependencies.\
It uses JSDoc for type definitions and TypeScript for type checking.\
The editor supports a modular plugin architecture where features can be enabled/disabled as needed.

**Architecture Components:**

- **Kernel** (`CoreKernel`): Central runtime container — orchestrates initialization, builds the Deps bag, manages Store
- **Deps** (`$`): Shared dependency object built by the Kernel — all services in one object. **Not the Kernel itself.**
- **Store**: Central runtime state (mode, focus, selection cache, etc.)
- **Config**: Context providers, option providers, event management
- **Logic**: DOM operations (selection, format, inline), shell operations (component, history, focus), panel UI (toolbar, menu, viewer)
- **Event**: Redux-like event orchestration (handlers, reducers, effects)
- **Plugins**: image, video, link, table, mention, etc.
- **Modules**: Modal, Controller, Figure, ColorPicker, etc.
- **Helpers**: DOM utilities, converters, env detection

**Terminology:**

| Subject               | Name                      | Description                                      |
| --------------------- | ------------------------- | ------------------------------------------------ |
| `CoreKernel` instance | **Kernel**                | Central runtime container (init, DI, lifecycle)  |
| `kernel.$` / `this.$` | **Deps** (dependency bag) | Shared dependency object — NOT the Kernel itself |
| `kernel.store`        | **Store**                 | Central runtime state management                 |

## Directory Structure

```
suneditor/
├── src/                      # Source code
│   ├── suneditor.js         # Factory entry point (create, init)
│   ├── events.js            # User event definitions (onChange, onImageUpload, etc.)
│   ├── typedef.js           # JSDoc type definitions
│   ├── core/                # Editor core
│   │   ├── editor.js        # Main Editor class (public API, plugin lifecycle, multi-root)
│   │   ├── kernel/          # L1: Dependency container & state
│   │   │   ├── coreKernel.js    # CoreKernel - dependency container, orchestrates initialization
│   │   │   ├── store.js         # Store - central runtime state (#state, mode)
│   │   │   └── kernelInjector.js # KernelInjector - base class for kernel consumers
│   │   ├── config/          # L2: Configuration & providers
│   │   │   ├── contextProvider.js   # Context/FrameContext Map management
│   │   │   ├── optionProvider.js    # Options/FrameOptions Map management
│   │   │   ├── instanceCheck.js     # Iframe-safe instanceof checks
│   │   │   └── eventManager.js      # Public event API (addEvent, removeEvent, triggerEvent)
│   │   ├── logic/           # L3: Business logic
│   │   │   ├── dom/         # DOM manipulation classes
│   │   │   │   ├── selection.js     # Selection & range manipulation
│   │   │   │   ├── html.js          # HTML get/set & sanitization
│   │   │   │   ├── format.js        # Block-level formatting
│   │   │   │   ├── inline.js        # Inline formatting (bold, italic, styles)
│   │   │   │   ├── listFormat.js    # List operations (create, edit, nested)
│   │   │   │   ├── nodeTransform.js # DOM node transformations
│   │   │   │   ├── char.js          # Character counting & limits
│   │   │   │   └── offset.js        # Position calculations
│   │   │   ├── shell/       # Editor operations
│   │   │   │   ├── component.js     # Component lifecycle (images, videos, etc.)
│   │   │   │   ├── focusManager.js  # Focus/blur management
│   │   │   │   ├── pluginManager.js # Plugin registry & lifecycle
│   │   │   │   ├── ui.js            # UI state (loading, alerts, theme)
│   │   │   │   ├── commandDispatcher.js # Command routing
│   │   │   │   ├── _commandExecutor.js  # Command execution
│   │   │   │   ├── history.js       # Undo/redo stack
│   │   │   │   └── shortcuts.js     # Keyboard shortcut mapping
│   │   │   └── panel/       # Panel UI
│   │   │       ├── toolbar.js       # Toolbar rendering & positioning
│   │   │       ├── menu.js          # Dropdown menu management
│   │   │       └── viewer.js        # View modes (code view, markdown view, fullscreen, preview)
│   │   ├── event/           # L4: Event orchestration (Redux-like)
│   │   │   ├── eventOrchestrator.js # Internal DOM event processing, handler binding
│   │   │   ├── executor.js          # Action dispatcher → maps actions to effects
│   │   │   ├── ports.js             # Event type definitions and constants
│   │   │   ├── actions/             # Action type definitions and creators
│   │   │   ├── handlers/            # DOM event listeners
│   │   │   ├── reducers/            # Event analyzers → return action lists
│   │   │   ├── rules/               # Granular key rules (enter, backspace, delete, arrow, tab)
│   │   │   ├── effects/             # Effect registries (common, keydown, ruleHelpers)
│   │   │   └── support/             # Support classes (selectionState, defaultLineManager)
│   │   ├── schema/          # Data definitions
│   │   │   ├── context.js       # Global context schema
│   │   │   ├── frameContext.js  # Per-frame context schema
│   │   │   └── options.js       # Options schema (base + frame)
│   │   └── section/         # DOM construction
│   │       ├── constructor.js   # Editor DOM structure builder
│   │       ├── codeLang.js      # Code language selector UI for <pre> blocks
│   │       └── documentType.js  # Document type handler (pagination)
│   ├── plugins/             # Modular features
│   │   ├── command/         # Direct actions (blockquote, list_bulleted, list_numbered, exportPDF, fileUpload)
│   │   ├── dropdown/        # Dropdown menus (align, font, fontColor, backgroundColor, blockStyle, textStyle, paragraphStyle, lineHeight, hr, layout, list, table/, template)
│   │   ├── modal/           # Dialog plugins (image/, video/, link, math, audio, drawing, embed)
│   │   ├── browser/         # Gallery plugins (imageGallery, videoGallery, audioGallery, fileGallery, fileBrowser)
│   │   ├── field/           # Autocomplete (mention)
│   │   ├── input/           # Toolbar inputs (fontSize, pageNavigator)
│   │   └── popup/           # Inline controllers (anchor)
│   ├── modules/             # UI components
│   │   ├── contract/        # Module contracts (Modal, Controller, Figure, etc.)
│   │   ├── manager/         # Managers (FileManager, ApiManager)
│   │   └── ui/              # UI utilities (SelectMenu, ModalAnchorEditor)
│   ├── hooks/               # Hook interface definitions
│   │   ├── base.js          # Base hooks (Event, Component, Core)
│   │   └── params.js        # Hook parameter type definitions
│   ├── interfaces/          # Plugin base classes & contracts
│   │   ├── plugins.js       # Plugin type classes (PluginCommand, PluginModal, etc.)
│   │   ├── contracts.js     # Contract interfaces (ModuleModal, EditorComponent, etc.)
│   │   └── index.js         # Interface exports
│   ├── helper/              # Pure utility functions
│   │   ├── converter.js     # String/HTML conversion
│   │   ├── env.js           # Browser/device detection
│   │   ├── keyCodeMap.js    # Keyboard event checking
│   │   ├── numbers.js       # Number validation
│   │   ├── unicode.js       # Special characters
│   │   ├── clipboard.js     # Clipboard API
│   │   └── dom/             # DOM utilities (check, query, utils)
│   ├── assets/              # Static assets (icons, CSS, design)
│   ├── langs/               # i18n language files
│   └── themes/              # CSS theme files
├── test/                    # Test suites
│   ├── unit/                # Jest unit tests
│   ├── integration/         # Jest integration tests
│   └── e2e/                 # Playwright E2E tests
├── types/                   # Generated TypeScript definitions
├── webpack/                 # Build configuration
└── dist/                    # Built bundles (not tracked in git)
```

## Technical Requirements

**Runtime Environment:**

- **JavaScript**: ES2022+ (modern browsers only)
- **Zero dependencies**: No external libraries in production bundle

**Development Environment:**

- **Node.js**: **v22** recommended, minimum v14+
- **Build tools**: Webpack 5, Babel, ESLint, Prettier

**Type System:**

- **JSDoc** for inline type annotations in source files
- **TypeScript** for type checking (no TS source files, only generated `.d.ts`)
- Generated types: `npm run ts-build`

**Testing Stack:**

- **Unit/Integration**: Jest with jsdom
- **E2E**: Playwright (Chromium)
- **Coverage**: Jest coverage reports

---

## Architecture

> **For detailed internal engineering, see [ARCHITECTURE.md](./ARCHITECTURE.md).**

**Layer Architecture:**

| Layer  | Directory | Responsibility                                            | Examples                                                        |
| ------ | --------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| **L1** | `kernel/` | Kernel (runtime container), Store (state), Deps bag (`$`) | CoreKernel, Store, KernelInjector                               |
| **L2** | `config/` | Configuration, context, options, event API                | ContextProvider, OptionProvider, InstanceCheck, EventManager    |
| **L3** | `logic/`  | Business logic, DOM operations, UI                        | Selection, Format, Component, Toolbar, History                  |
| **L4** | `event/`  | Internal DOM event processing                             | EventOrchestrator, handlers, reducers, rules, executor, effects |

**Initialization Order:**

```
1. suneditor.create() → Validates target, merges options
2. new Editor() → Creates editor instance
3. Constructor() → Builds DOM (toolbar, statusbar, wysiwyg frames)
4. new CoreKernel() → Kernel (runtime container)
   a. L1: Store (state management)
   b. Deps Phase 1: Config deps added to $ (L2)
   c. L3: Logic instances created (dom, shell, panel)
   d. Deps Phase 2: Logic deps added to $ (Deps bag complete)
   e. L3 Init Pass: _init() called on L3 instances that need post-Phase 2 setup
   f. L4: EventOrchestrator
5. editor.#Create() → Plugin registration, event setup
6. editor.#editorInit() → Frame init, triggers onload event
```

---

### Plugin System (`src/plugins/`)

Plugins are modular features that extend editor functionality.

**Architecture Pattern**: ES6 classes extending plugin type base classes from `src/interfaces/plugins.js`, which extend `KernelInjector` (injects `this.$` — the Deps bag).

**Inheritance Chain:**

```
KernelInjector → Base → PluginCommand/PluginModal/PluginDropdown/...
                         ↓
                    constructor(kernel) → super(kernel) → this.$ = kernel.$
```

**Plugin Type Base Classes:**

| Base Class               | Type            | Required Methods    | Examples                                              |
| ------------------------ | --------------- | ------------------- | ----------------------------------------------------- |
| **`PluginCommand`**      | `command`       | `action()`          | blockquote, list_bulleted, list_numbered, exportPDF   |
| **`PluginDropdown`**     | `dropdown`      | `action()`          | align, font, fontColor, blockStyle, lineHeight        |
| **`PluginDropdownFree`** | `dropdown-free` | (none)              | table, fontColor, backgroundColor                     |
| **`PluginModal`**        | `modal`         | `open()`            | image, video, link, math, audio, drawing, embed       |
| **`PluginBrowser`**      | `browser`       | `open()`, `close()` | imageGallery, videoGallery, audioGallery, fileGallery |
| **`PluginField`**        | `field`         | (none)              | mention                                               |
| **`PluginInput`**        | `input`         | (none)              | fontSize, pageNavigator                               |
| **`PluginPopup`**        | `popup`         | `show()`            | anchor                                                |

**Plugin Access Pattern:**

All plugins access dependencies through `this.$`:

```javascript
import { PluginModal } from '../../interfaces';

class MyPlugin extends PluginModal {
	static key = 'myPlugin';
	static className = 'se-btn-my-plugin';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 */
	constructor(kernel, pluginOptions) {
		super(kernel); // KernelInjector → this.$ = kernel.$ (Deps bag)
		this.title = this.$.lang.myPlugin; // access via Deps
		this.icon = 'myPlugin';
	}

	open(target) {
		const range = this.$.selection.get();
		const wysiwyg = this.$.frameContext.get('wysiwyg');
		const height = this.$.frameOptions.get('height');
		this.$.html.insert('<p>content</p>');
		this.$.history.push(false);
	}
}
```

**Multi-Interface Pattern (TypeScript):**

A single plugin can implement multiple interfaces — combining a base plugin type with module contracts and component hooks. In TypeScript, use `implements` to compose these:

```typescript
import { interfaces } from 'suneditor';
import type { SunEditor } from 'suneditor/types';

class MyPlugin extends interfaces.PluginModal
	implements interfaces.ModuleModal, interfaces.EditorComponent
{
	static key = 'myPlugin';

	_element: HTMLElement | null = null;

	constructor(kernel: SunEditor.Kernel) {
		super(kernel);
	}

	// PluginModal base
	open(target?: HTMLElement) { ... }

	// ModuleModal interface
	async modalAction() { return true; }
	modalOff(isUpdate: boolean) { ... }

	// EditorComponent interface
	static component(node: Node) {
		return /^IMG$/i.test(node?.nodeName) ? node : null;
	}
	componentSelect(target: HTMLElement) { ... }
}
```

**Available Contracts and Base Types (`interfaces.*`):**

| Type                    | Purpose               | Key Methods                                |
| ----------------------- | --------------------- | ------------------------------------------ |
| **`ModuleModal`**       | Modal dialog behavior | `modalAction()`, `modalOn()`, `modalOff()` |
| **`ModuleController`**  | Floating controller   | `controllerAction()`, `controllerOn()`     |
| **`ModuleColorPicker`** | Color picker behavior | `colorPickerAction()`                      |
| **`ModuleHueSlider`**   | Hue slider behavior   | `hueSliderAction()`                        |
| **`ModuleBrowser`**     | Gallery browser       | `browserInit()`                            |
| **`EditorComponent`**   | Component lifecycle   | `componentSelect()`, `componentDestroy()`  |
| **`PluginDropdown`**    | Plugin base class     | `on()`, `action()`                         |

Contracts can be combined with a base plugin class via `implements`.

**Available via `this.$` (Deps bag):**

- **Config**: `options`, `frameOptions`, `context`, `frameContext`, `frameRoots`, `lang`, `icons`
- **DOM Logic**: `selection`, `html`, `format`, `inline`, `listFormat`, `nodeTransform`, `char`, `offset`
- **Shell Logic**: `component`, `focusManager`, `pluginManager`, `plugins`, `ui`, `commandDispatcher`, `history`, `shortcuts`
- **Panel Logic**: `toolbar`, `subToolbar` (second `Toolbar` instance, only with `_subMode`), `menu`, `viewer`
- **Services**: `eventManager`, `contextProvider`, `optionProvider`, `instanceCheck`, `store`
- **Environment**: `facade` (editor instance)

---

#### Plugin Hooks & Methods Reference

> **Full reference:** [Custom Plugin Guide](./guide/custom-plugin.md) — Complete hook tables, parameter types, code examples, and multi-interface patterns.

Plugin hooks are organized into four categories:

| Category            | Interfaces                                                                                 | Key Methods                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Common Hooks**    | (all plugins)                                                                              | `active()`, `init()`, `retainFormat()`, `shortcut()`, `setDir()`                                       |
| **Event Hooks**     | (all plugins)                                                                              | `onKeyDown`, `onInput`, `onClick`, `onPaste`, `onFocus`, `onBlur`, +8 more                             |
| **Module Hooks**    | `ModuleModal`, `ModuleController`, `ModuleColorPicker`, `ModuleHueSlider`, `ModuleBrowser` | `modalAction()`, `controllerAction()`, `colorPickerAction()`, etc.                                     |
| **Component Hooks** | `EditorComponent`                                                                          | `componentSelect()`, `componentDeselect()`, `componentEdit()`, `componentDestroy()`, `componentCopy()` |

**Event hook execution order** is controlled by `eventIndex` in `static options` (lower = earlier).

---

### Modules (`src/modules/`)

**Architecture Pattern**: ES6 classes that receive `$` (Deps bag) directly — **no inheritance from KernelInjector**.

- Constructor: `constructor(inst, $, ...)` → receives plugin instance + Deps bag + custom params
- Private fields: `#privateField` (ES2022 syntax)
- Manually instantiated by plugins (not auto-registered)

**Module Classes:**

| Module                  | Folder      | Purpose              | Constructor Pattern                |
| ----------------------- | ----------- | -------------------- | ---------------------------------- |
| **`Modal`**             | `contract/` | Dialog windows       | `new Modal(inst, $, element)`      |
| **`Controller`**        | `contract/` | Floating tooltips    | `new Controller(inst, $, element)` |
| **`Figure`**            | `contract/` | Resize/align wrapper | `new Figure(inst, $, ...)`         |
| **`ColorPicker`**       | `contract/` | Color palette        | `new ColorPicker(inst, $, ...)`    |
| **`HueSlider`**         | `contract/` | HSL color wheel      | `new HueSlider(inst, $, ...)`      |
| **`Browser`**           | `contract/` | Gallery UI           | `new Browser(inst, $, ...)`        |
| **`FileManager`**       | `manager/`  | File uploads         | Instance + async                   |
| **`ApiManager`**        | `manager/`  | XHR requests         | `new ApiManager(inst, $, ...)`     |
| **`SelectMenu`**        | `ui/`       | Custom dropdowns     | Instance + items                   |
| **`ModalAnchorEditor`** | `ui/`       | Link form            | Instance + form                    |
| **`_DragHandle`**       | `ui/`       | Drag state           | Map (not class)                    |

### Helper Utilities (`src/helper/`)

**Architecture Pattern**: Pure functions, no classes or state

- Export: `export function funcName()` + `export default { funcName }`
- Can be imported as `import { dom } from '../helper'` → `dom.check.isElement()`

**Helper Modules:**

| Module                | Key Functions                                                     | Purpose                           |
| --------------------- | ----------------------------------------------------------------- | --------------------------------- |
| **`markdown.js`**     | `jsonToMarkdown`, `markdownToHtml`                                | Markdown ↔ HTML conversion (GFM) |
| **`converter.js`**    | `htmlToEntity`, `htmlToJson`, `debounce`, `toFontUnit`, `rgb2hex` | String/HTML conversion            |
| **`env.js`**          | `isMobile`, `isOSX_IOS`, `isClipboardSupported`, `_w`, `_d`       | Browser/device detection          |
| **`keyCodeMap.js`**   | `isEnter`, `isCtrl`, `isArrow`, `isComposing`                     | Keyboard event checking           |
| **`numbers.js`**      | `is`, `get`, `isEven`, `isOdd`                                    | Number validation                 |
| **`unicode.js`**      | `zeroWidthSpace`, `escapeStringRegexp`                            | Special characters                |
| **`clipboard.js`**    | `write`                                                           | Clipboard with iframe handling    |
| **`dom/domCheck.js`** | `isElement`, `isText`, `isWysiwygFrame`, `isComponentContainer`   | Node type checking                |
| **`dom/domQuery.js`** | `getParentElement`, `getChildNode`, `getNodePath`                 | DOM tree navigation               |
| **`dom/domUtils.js`** | `addClass`, `createElement`, `setStyle`, `removeItem`             | DOM operations                    |

---

### Options System

Options are split into two categories:

1. **Base Options** (`$.options`): Shared across all frames (plugins, mode, toolbar, shortcuts, events)
2. **Frame Options** (`$.frameOptions`): Per-frame configuration (width, height, placeholder, iframe, statusbar)

Options use Map-based storage. Some are marked `'fixed'` (immutable) or resettable via `editor.resetOptions()`.

### Context System

**1. Global Context (`$.context`)**

- Shared UI elements (toolbar, statusbar, modal overlay)
- Access: `$.context.get('toolbar')`

**2. Frame Context (`$.frameContext`)**

- Per-frame state and DOM references (wysiwyg, code, readonly state, etc.)
- Convenience pointer to `frameRoots.get(store.get('rootKey'))`
- Access: `$.frameContext.get('wysiwyg')`

**3. Frame Roots Storage (`$.frameRoots`)**

- `Map<rootKey, FrameContext>` — actual data storage for all frames
- `null` key for single-root, custom string for multi-root

**4. Frame Options (`$.frameOptions`)**

- Convenience pointer to `frameContext.get('options')`
- Access: `$.frameOptions.get('height')`

---

## Essential Commands

### Development

```bash
npm run dev              # Start local dev server (http://localhost:8088)
npm start               # Alias for npm run dev
```

### Building

```bash
npm run build:dev       # Build for development (with source maps)
npm run build:prod      # Build for production (minified)
```

### Testing

```bash
npm test                # Run Jest unit tests (silent mode)
npm run test:watch      # Run Jest in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:e2e        # Run Playwright E2E tests (webServer starts/reuses localhost:8088)
npm run test:e2e:ui     # Run E2E tests with Playwright UI
npm run test:e2e:headed # Run E2E tests in headed mode
npm run test:all        # Run all tests (Jest + Playwright)
```

### Linting

```bash
npm run lint            # All: ESLint (JS + TS) + TypeScript type check + Architecture check
npm run lint:type       # Run TypeScript type checking without emitting files
npm run lint:fix-js     # Auto-fix JavaScript issues with ESLint
npm run lint:fix-ts     # Auto-fix TypeScript issues with ESLint
npm run lint:fix-all    # Fix all lint issues (JS + TS)
npm run check:arch      # Check architecture dependencies with dependency-cruiser
```

### TypeScript & i18n

```bash
npm run ts-build        # Build TypeScript definitions from JSDoc
npm run check:langs     # Sync language files (requires Google API credentials)
npm run check:inject    # Inject plugin JSDoc types into options.js
```

---

## Naming Conventions

**File Naming:**

- **JavaScript files**: camelCase (e.g., `selection.js`, `eventManager.js`)
- **Class files**: Match class name (e.g., `Modal.js` for `Modal` class)
- **Plugin files**: Match plugin key (e.g., `blockquote.js` for key `'blockquote'`)

**Code Naming:**

- **Classes**: PascalCase (e.g., `KernelInjector`, `Modal`, `CoreKernel`)
- **Functions/Methods**: camelCase (e.g., `getRange`, `setContent`, `applyTagEffect`)
- **Private fields/methods**: `#privateField`, `#privateMethod()` (ES2022)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ACTION_TYPE`, `EVENT_TYPES`)

**Plugin Naming:**

- **Plugin keys**: lowercase string (e.g., `'image'`, `'video'`, `'blockStyle'`)
- **Plugin types**: lowercase string (e.g., `'command'`, `'modal'`, `'dropdown'`)
- **Plugin class names**: PascalCase (e.g., `Blockquote`, `Link`, `Image`)

**CSS Naming:**

- **Prefix**: All classes start with `se-` (e.g., `se-wrapper`, `se-component`)
- **Component classes**: `se-component`, `se-flex-component`, `se-inline-component`

---

## Common Pitfalls

**DON'T:**

- Use `innerHTML` directly on wysiwyg frame → Use `this.$.html.set(content)`
- Access `frameRoots` directly → Use `this.$.frameContext`
- Register events without EventManager → Use `this.$.eventManager.addEvent(element, 'click', handler)`
- Use `document.execCommand` → Use `this.$.html`, `this.$.format`, or `this.$.inline` methods
- Create plugin without extending base class → Always extend from `src/interfaces/plugins.js`
- Access kernel internals directly → Use `this.$` (the Deps bag, not the kernel itself)

**DO:**

- Use `this.$.selection` for all selection management
- Use `this.$.html` for content manipulation
- Use `this.$.format` for block-level formatting
- Register all events via `this.$.eventManager` for automatic cleanup
- Use `this.$.frameContext` and `this.$.frameOptions` instead of direct `frameRoots` access
- Check element types with `dom.check` methods (iframe-safe)
- Follow the Redux pattern for event handling (Handler → Reducer → Actions → Effects)
- Use specific JSDoc types (`SunEditor.Kernel` for constructors, `SunEditor.Deps` for deps)

---

## Plugin Registration Flow

```
options.plugins: [ImagePlugin, VideoPlugin, ...]  // or { image: ImagePlugin, video: VideoPlugin, ... }
         ↓
Constructor.js: stores as class references in product.plugins
         ↓
CoreKernel → PluginManager: loops through plugins
         ↓
new Plugin(kernel, options) → super(kernel) → KernelInjector → this.$ = kernel.$ (Deps bag)
         ↓
Plugin events registered (_onPluginEvents Map)
```

**Runtime Activation:**

| Plugin Type | Flow                                                                       |
| ----------- | -------------------------------------------------------------------------- |
| Command     | `button.click` → `commandDispatcher.run()` → `plugin.action()`             |
| Modal       | `button.click` → `commandDispatcher.run()` → `plugin.open()` → Modal shows |
| Dropdown    | `button.click` → `menu.dropdownOn()` → `plugin.on()`                       |

**Key Rule:** Always pass **class references**, not instances:

```javascript
// Correct
plugins: [MyPlugin];

// Wrong - Kernel cannot manage lifecycle
plugins: [new MyPlugin()];
```

---

## Example Implementations

**Simple Command Plugin:**

- `src/plugins/command/blockquote.js` - Minimal command plugin

**Modal Plugin with Form:**

- `src/plugins/modal/link.js` - Link dialog with form validation
- `src/plugins/modal/image/index.js` - Image upload with Figure module

**Dropdown Plugin:**

- `src/plugins/dropdown/align.js` - Simple dropdown menu

**Component Plugin:**

- `src/plugins/modal/image/index.js` - Full component lifecycle
- `src/plugins/modal/video/index.js` - Component with multiple content types

**Core Logic Class:**

- `src/core/logic/dom/selection.js` - Selection and range manipulation
- `src/core/logic/dom/format.js` - Block-level formatting operations
- `src/core/logic/shell/component.js` - Component lifecycle management

**Module:**

- `src/modules/contract/Modal.js` - Dialog window system
- `src/modules/contract/Controller.js` - Floating toolbar controller

**Event Handling:**

- `src/core/event/handlers/handler_ww_key.js` - Wysiwyg keyboard handlers
- `src/core/event/reducers/keydown.reducer.js` - Keydown event analysis
- `src/core/event/rules/keydown.rule.enter.js` - Enter key rule logic
- `src/core/event/actions/index.js` - Action type definitions and creators
- `src/core/event/executor.js` - Action dispatcher
- `src/core/event/effects/keydown.registry.js` - Keydown effect handlers
- `src/core/event/effects/common.registry.js` - Common effect handlers

**Example Event Flow (Enter Key):**

```
1. User presses Enter
   ↓
2. handler_ww_key.js captures keydown event
   ↓
3. keydown.reducer.js analyzes the event with current editor state
   ↓
4. Reducer delegates to keydown.rule.enter.js for Enter-specific logic
   ↓
5. Returns action list: [{t: 'enter.line.addDefault', p: {...}}, {t: 'history.push', p: {...}}]
   ↓
6. executor.js dispatches actions through effect registries (common + keydown)
   ↓
7. Effects execute:
   - 'enter.line.addDefault' → calls format.addLine()
   - 'history.push' → calls history.push()
   ↓
8. DOM updated, selection adjusted, onChange event triggered
```

---

## Testing Strategy

### Unit Tests (`test/unit/`)

- Jest with jsdom environment
- Test individual functions and components in isolation
- Module path alias: `@/` maps to `src/`
- Coverage thresholds: 70% statements, 60% branches, 80% functions, 70% lines

### Integration Tests (`test/integration/`)

- Jest-based integration tests for cross-component functionality

### E2E Tests (`test/e2e/`)

- Playwright tests running against local dev server
- Run on Chromium by default

---

## Initialization: `onload` Event

Editor initialization completes **asynchronously**. Use `onload` for operations that depend on fully initialized UI/state:

```javascript
// Wrong - may fail
const editor = SUNEDITOR.create('#editor');
editor.focusManager.focus();

// Correct
SUNEDITOR.create('#editor', {
	events: {
		onload: ({ $ }) => {
			$.focusManager.focus();
			$.html.set('<p>Initial content</p>');
		},
	},
});
```

**Why:** `suneditor.create()` returns immediately, but toolbar visibility, ResizeObserver registration, and history reset happen in a deferred `setTimeout`. Calling methods before `onload` may cause errors.

---

## iframe Mode

SunEditor supports **DIV mode** (default) and **iframe mode** (`iframe: true`).

```javascript
SUNEDITOR.create('#editor', {
	iframe: true,
	iframe_attributes: {
		sandbox: 'allow-downloads', // allow-same-origin is auto-added
	},
});
```

**SSR frameworks (Next.js/Nuxt):** Use dynamic import with `ssr: false` to avoid `contentDocument is null` errors.

---

## Markdown View

SunEditor supports a **Markdown View** mode alongside the existing Code View and WYSIWYG modes. The markdown view converts editor content to GitHub Flavored Markdown (GFM) for editing and converts back to HTML on exit.

**Toggle:** Use the `markdownView` button in the toolbar or call `editor.viewer.markdownView()` programmatically.

**Supported GFM Syntax:**

- Headings (`#` ~ `######`), paragraphs, line breaks
- **Bold**, _italic_, ~~strikethrough~~, `inline code`, ==highlight==
- Ordered/unordered lists, task lists (`- [x]`)
- Blockquotes (`>`), fenced code blocks (` ``` `), horizontal rules (`---`)
- Links, images, tables (pipe syntax with alignment)

**How it works:**

1. **WYSIWYG → Markdown**: `converter.htmlToJson()` → `markdown.jsonToMarkdown()` — converts the editor's HTML to a JSON tree, then to GFM string
2. **Markdown → WYSIWYG**: `markdown.markdownToHtml()` — parses GFM back to HTML

**Key files:**

- `src/helper/markdown.js` — Markdown ↔ HTML converter (GFM)
- `src/core/logic/panel/viewer.js` — View mode management (code view, markdown view, fullscreen, preview)

**Mutual exclusivity:** Code View and Markdown View are mutually exclusive — activating one automatically deactivates the other.

---

## Code Language Selector

The `<pre>` code block language selector (`codeLang.js`) provides a UI for selecting programming languages on code blocks.

**Option:** `codeLangs`

```javascript
suneditor.create('#editor', {
	codeLangs: ['javascript', 'python', 'html', 'css', 'json'],
});
```

- A language selector button appears on hover over `<pre>` elements
- Defaults to common languages (javascript, typescript, html, css, json, python, java, etc.)
- Set to `[]` to disable the feature
- Selected language is stored as `class="language-{lang}"` on the `<pre>` element

**Key files:**

- `src/core/section/codeLang.js` — CodeLang class (Controller + SelectMenu UI)

---

## Build System

- **Webpack** for bundling (config in `webpack/`)
- **Babel** (`@babel/preset-env`) with Browserslist targets
- **ESLint** with Prettier for code quality
- **Output**: `dist/suneditor.min.js` and `dist/suneditor.min.css`

The `dist/` folder is NOT tracked in git and is built via CI/CD.

---

## Changes Log

When making code changes (bug fixes, new features, improvements, security patches, etc.), **always update `changes.md`** in the project root.
This file is used to generate the demo site's changelog. Keep entries concise and user-facing.

**Format:**

```markdown
## [Category] - YYYY-MM-DD

- **tag:** Short description of the change
```

**Categories:** `Fix`, `Feature`, `Improvement`, `Security`, `Breaking`\
**Tags (examples):** `html`, `toolbar`, `plugin:image`, `selection`, `clipboard`, `core`, `api`, etc.

**Example:**

```markdown
## Security - 2026-03-29

- **html:** Block obfuscated `javascript:` protocol in href/src attributes (entity/URL-encoded whitespace bypass)
```

**Rules:**

- Append new entries at the **top** of the file (newest first)
- One bullet per logical change
- Do not include internal refactors that have no user-visible effect
- If `changes.md` does not exist yet, create it

---

## Supplementary Guides

- [Custom Plugin Guide](./guide/custom-plugin.md) - Creating custom plugins
- [External Libraries](./guide/external-libraries.md) - CodeMirror, KaTeX, MathJax integration
- [Type Definitions](./guide/typedef-guide.md) - SunEditor namespace types reference
