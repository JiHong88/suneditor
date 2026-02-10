# GUIDE.md

> **Purpose:**
> Unified technical reference for developers and AI agents.
> Defines architecture, conventions, and development workflow.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Directory Structure](#directory-structure)
- [Technical Requirements](#technical-requirements)
- [Overall Architecture](#overall-architecture)
- [Content Structure Design](#content-structure-design)
- [Multi-Root Architecture](#multi-root-architecture)
- [Plugin System](#plugin-system-srcplugins)
- [Core Components](#core-components-srccore)
- [Modules](#modules-srcmodules)
- [Essential Commands](#essential-commands)
- [Testing Strategy](#testing-strategy)
- Supplementary Guides
    - [External Libraries](./guide/external-libraries.md) - CodeMirror, KaTeX, MathJax

---

## Project Overview

SunEditor is a lightweight, fast WYSIWYG editor written in pure vanilla JavaScript (ES2022+) with no dependencies.
It uses JSDoc for type definitions and TypeScript for type checking.
The editor supports a modular plugin architecture where features can be enabled/disabled as needed.

**Architecture Components:**

- **Kernel**: Central dependency container, state store, dependency injection
- **Config**: Context providers, option providers, event management
- **Logic**: DOM operations (selection, format, inline), shell operations (component, history, focus), panel UI (toolbar, menu, viewer)
- **Event**: Redux-like event orchestration (handlers, reducers, effects)
- **Plugins**: image, video, link, table, mention, etc.
- **Modules**: Modal, Controller, Figure, ColorPicker, etc.
- **Helpers**: DOM utilities, converters, env detection

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
│   │   │       └── viewer.js        # View modes (code view, fullscreen, preview)
│   │   ├── event/           # L4: Event orchestration (Redux-like)
│   │   │   ├── eventOrchestrator.js # Internal DOM event processing, handler binding
│   │   │   ├── ports.js             # Event type definitions and constants
│   │   │   ├── handlers/            # DOM event listeners
│   │   │   ├── reducers/            # Event analyzers → return action lists
│   │   │   ├── effects/             # Effect registries (side effects)
│   │   │   └── support/             # Support classes (selectionState, defaultLineManager)
│   │   ├── schema/          # Data definitions
│   │   │   ├── context.js       # Global context schema
│   │   │   ├── frameContext.js  # Per-frame context schema
│   │   │   └── options.js       # Options schema (base + frame)
│   │   └── section/         # DOM construction
│   │       ├── constructor.js   # Editor DOM structure builder
│   │       └── documentType.js  # Document type handler (pagination)
│   ├── plugins/             # Modular features
│   │   ├── command/         # Direct actions (blockquote, list, exportPDF)
│   │   ├── dropdown/        # Dropdown menus (align, font, blockStyle, table)
│   │   ├── modal/           # Dialog plugins (image, video, link, math)
│   │   ├── browser/         # Gallery plugins (imageGallery, videoGallery)
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

- **Node.js**: 22 recommended, minimum 14+
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

### Overall Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        suneditor.js                          │
│                    (Factory Entry Point)                      │
│  • create(target, options) → new Editor()                    │
│  • init(options) → { create() }                              │
└────────────────────────────┬─────────────────────────────────┘
                             │ creates
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                         editor.js                            │
│                  (Main Editor Class - Facade)                │
│                                                              │
│  Public API: focus/blur, html.get/set, run, registerPlugin  │
│  Internal: Plugin lifecycle, multi-root, resetOptions       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    CoreKernel (L1)                      │  │
│  │          Dependency Container & Orchestrator            │  │
│  │                                                        │  │
│  │  ┌─────────┐  ┌──────────────────────────────────┐     │  │
│  │  │  Store   │  │  $ (Deps bag)                    │     │  │
│  │  │ #state   │  │  All dependencies in one object  │     │  │
│  │  │ mode     │  │  Shared with all consumers       │     │  │
│  │  └─────────┘  └──────────────────────────────────┘     │  │
│  │                                                        │  │
│  │  L2: Config ─────────────────────────────────────────  │  │
│  │  │ contextProvider  │ optionProvider                   │  │
│  │  │ instanceCheck    │ eventManager                     │  │
│  │                                                        │  │
│  │  L3: Logic ──────────────────────────────────────────  │  │
│  │  │ dom/: selection, format, inline, html, listFormat  │  │
│  │  │       nodeTransform, char, offset                   │  │
│  │  │ shell/: component, focusManager, pluginManager     │  │
│  │  │         ui, commandDispatcher, history, shortcuts    │  │
│  │  │ panel/: toolbar, subToolbar, menu, viewer           │  │
│  │                                                        │  │
│  │  L4: Event ──────────────────────────────────────────  │  │
│  │  │ EventOrchestrator (handlers, reducers, effects)     │  │
│  │  └─────────────────────────────────────────────────    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Layer Architecture:**

| Layer  | Directory | Responsibility                             | Examples                                       |
| ------ | --------- | ------------------------------------------ | ---------------------------------------------- |
| **L1** | `kernel/` | Dependency container, state store          | CoreKernel, Store, KernelInjector              |
| **L2** | `config/` | Configuration, context, options, event API | ContextProvider, OptionProvider, EventManager  |
| **L3** | `logic/`  | Business logic, DOM operations, UI         | Selection, Format, Component, Toolbar, History |
| **L4** | `event/`  | Internal DOM event processing              | EventOrchestrator, handlers, reducers, effects |

**Initialization Order:**

```
1. suneditor.create() → Validates target, merges options
2. new Editor() → Creates editor instance
3. Constructor() → Builds DOM (toolbar, statusbar, wysiwyg frames)
4. new CoreKernel() → Dependency container
   a. L1: Store (state)
   b. $ Phase 1: Config deps (L2)
   c. L3: Logic (dom, shell, panel)
   d. $ Phase 2: Logic deps added to $
   e. L4: EventOrchestrator
5. editor.#Create() → Plugin registration, event setup
6. editor.#editorInit() → Frame init, triggers onload event
```

### CoreKernel & Dependency Injection

CoreKernel is the central dependency container. It creates all internal instances in a defined order and assembles the `$` (Deps) object that is shared across the entire system.

**`$` (Deps) Object:**

The `$` object is a flat bag of all dependencies, built in two phases:

```
$ = {
    // L1: Core
    facade,              // Editor instance (public API)
    store,               // Store instance
    _w, _d,              // Window, Document

    // L2: Config (Phase 1 - available to L3 constructors)
    contextProvider,     // Context/FrameContext management
    optionProvider,      // Options/FrameOptions management
    instanceCheck,       // Iframe-safe type checks
    eventManager,        // Public event API

    // L2: Convenience accessors
    frameRoots,          // Map<rootKey, FrameContext>
    context,             // Global context (toolbar, statusbar, etc.)
    options,             // Base options Map
    icons,               // Icon set
    lang,                // Language strings
    frameContext,         // Current frame context (pointer)
    frameOptions,         // Current frame options (pointer)

    // L3: Logic (Phase 2 - added after all L3 instances created)
    // dom/
    offset, selection, format, inline,
    listFormat, html, nodeTransform, char,
    // shell/
    component, focusManager, pluginManager, plugins,
    ui, commandDispatcher, history, shortcuts,
    // panel/
    toolbar, subToolbar, menu, viewer
}
```

**Dependency Access Patterns:**

| Consumer                   | Constructor                 | Access Pattern                                          |
| -------------------------- | --------------------------- | ------------------------------------------------------- |
| **Plugin**                 | `constructor(kernel)`       | `this.$` via KernelInjector                             |
| **Core Logic** (L3)        | `constructor(kernel)`       | `#kernel`, `#$` (= kernel.$), `#store` (= kernel.store) |
| **Module**                 | `constructor(inst, $, ...)` | `#$` (Deps passed directly)                             |
| **EventOrchestrator** (L4) | `constructor(kernel)`       | `this.$` via KernelInjector                             |

**Example - Plugin:**

```javascript
import { PluginCommand } from '../../interfaces';

class Blockquote extends PluginCommand {
	static key = 'blockquote';

	constructor(kernel) {
		super(kernel); // KernelInjector → this.$ = kernel.$
		this.title = this.$.lang.tag_blockquote;
	}

	action() {
		const node = this.$.selection.getNode();
		this.$.format.applyBlock(this.quoteTag.cloneNode(false));
	}
}
```

**Example - Core Logic Class:**

```javascript
class Component {
	#kernel;
	#$;
	#store;

	constructor(kernel) {
		this.#kernel = kernel;
		this.#$ = kernel.$;
		this.#store = kernel.store;
		// Cache frequently used deps
		this.#options = this.#$.options;
		this.#frameContext = this.#$.frameContext;
		this.#eventManager = this.#$.eventManager;
	}
}
```

**Example - Module:**

```javascript
class Modal {
    #$;

    constructor(inst, $, element) {
        this.#$ = $;  // Deps passed directly, no inheritance
        this.inst = inst;
        this.#$.eventManager.addEvent(element, 'submit', ...);
    }
}
```

### Store

Store manages the editor's runtime state. It uses a private `#state` object accessed via `get(key)` / `set(key, value)` methods, with a subscribe/notify system for state change observation.

**State Keys (flat, no prefix):**

| Key                     | Type       | Default          | Description                    |
| ----------------------- | ---------- | ---------------- | ------------------------------ |
| `rootKey`               | `*`        | `product.rootId` | Current root frame key         |
| `hasFocus`              | `boolean`  | `false`          | Whether the editor has focus   |
| `tabSize`               | `number`   | `4`              | Tab character space count      |
| `indentSize`            | `number`   | `25`             | Block indent margin (px)       |
| `codeIndentSize`        | `number`   | `2`              | Code view indent space count   |
| `currentNodes`          | `string[]` | `[]`             | Selection path tag names       |
| `currentNodesMap`       | `string[]` | `[]`             | Active command/style names     |
| `initViewportHeight`    | `number`   | `0`              | Viewport height at init        |
| `currentViewportHeight` | `number`   | `0`              | Current visual viewport height |
| `controlActive`         | `boolean`  | `false`          | Controller/component active    |
| `isScrollable`          | `function` | `(fc) => ...`    | Frame content scrollability    |
| `_lastSelectionNode`    | `?Node`    | `null`           | Last selection node (cache)    |
| `_range`                | `?Range`   | `null`           | Cached selection range         |
| `_mousedown`            | `boolean`  | `false`          | Mouse button pressed           |
| `_preventBlur`          | `boolean`  | `false`          | Suppress blur handling         |
| `_preventFocus`         | `boolean`  | `false`          | Suppress focus handling        |

**Direct Properties (not in #state):**

- `store.mode` - Immutable toolbar mode flags (`isClassic`, `isInline`, `isBalloon`, `isBalloonAlways`, `isSubBalloon`, `isSubBalloonAlways`)
- `store._editorInitFinished` - Editor initialization complete flag

**Usage:**

```javascript
// Read
const rootKey = store.get('rootKey');
const hasFocus = store.get('hasFocus');

// Write (notifies subscribers)
store.set('hasFocus', true);
store.set('_preventBlur', false);

// Subscribe
const unsubscribe = store.subscribe('hasFocus', (newVal, oldVal) => { ... });
unsubscribe(); // cleanup
```

### Type System

**Key Type Names:**

| JSDoc Type               | Meaning            | Used For                              |
| ------------------------ | ------------------ | ------------------------------------- |
| `SunEditor.Kernel`       | CoreKernel class   | Constructor `@param` in L3/L4 classes |
| `SunEditor.Deps`         | `$` dependency bag | `this.$` type, event callback params  |
| `SunEditor.Store`        | Store class        | `kernel.store`, `this.#store`         |
| `SunEditor.Instance`     | Editor class       | Public API facade                     |
| `SunEditor.Context`      | ContextMap         | Global context (toolbar, statusbar)   |
| `SunEditor.FrameContext` | FrameContextMap    | Per-frame context                     |
| `SunEditor.Options`      | BaseOptionsMap     | Shared options                        |
| `SunEditor.FrameOptions` | FrameOptionsMap    | Per-frame options                     |

**Rule:** `SunEditor.Kernel` is used ONLY for constructor parameter types. For everything else (event params, plugin `this.$`, module deps), use `SunEditor.Deps`.

**Data Flow:**

```
1. Wysiwyg User Action (typing, paste, etc.):
   User Action → EventOrchestrator → Handler → Reducer → Actions → Effects → Logic Classes
                                                                                    ↓
                                                                              [Plugin action]
                                                                                    ↓
                                                                               DOM Update
                                                                                    ↓
                                                                             History Push
                                                                                    ↓
                                                                        Trigger onChange Event
```

### EventManager vs EventOrchestrator

The event system is split into two distinct classes:

|              | EventManager (L2)                                                                | EventOrchestrator (L4)                                                      |
| ------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Location** | `config/eventManager.js`                                                         | `event/eventOrchestrator.js`                                                |
| **Role**     | Public event registration API                                                    | Internal DOM event processing                                               |
| **Methods**  | `addEvent`, `removeEvent`, `addGlobalEvent`, `removeGlobalEvent`, `triggerEvent` | `_addCommonEvents`, `_addFrameEvents`, `applyTagEffect`, `_callPluginEvent` |
| **Used by**  | Plugins, modules, core logic                                                     | CoreKernel only (internal)                                                  |
| **Extends**  | None                                                                             | KernelInjector                                                              |

**EventManager** is available as `this.$.eventManager` throughout the system. **EventOrchestrator** is created by CoreKernel and manages the internal event pipeline.

---

### Content Structure Design

SunEditor's content is organized into **three fundamental units** with exactly **one state being mandatory** at any position:

> All formatting is option-based. You can customize by defining `block`, `line`, and `component` types to match this format.

#### **1. Line** (Format Line)

- **Definition**: Basic text container elements that hold inline content and text
- **Purpose**: Contains inline content, text, and inline formatting (bold, italic, etc.)
- **Validation**: `format.isLine(element)` - checks against `formatLine` regex
- **Default Tags**: `P`, `H[1-6]`, `LI`, `TH`, `TD`, `DETAILS`, `PRE`
- **Subtypes**:
    - **Normal Line** (`format.isNormalLine()`): Standard text containers - `P`, `DIV`, `H1-H6`, `LI`, `DETAILS`
        - Line breaks: Use Enter key to create new line elements
        - Example: `<p>Line 1</p><p>Line 2</p>`
    - **BR Line** (`format.isBrLine()`): Line breaks use `<BR>` tags - `PRE`
        - Line breaks: Enter creates `<BR>` within same element
        - Example: `<pre>Line 1<br>Line 2</pre>`
    - **Closure BR Line** (`format.isClosureBrLine()`): BR lines that cannot be exited with Enter/Backspace
        - Used for special constrained editing contexts (e.g., table cells with BR mode)

#### **2. Block** (Format Block)

- **Definition**: Structural container elements that wrap lines
- **Purpose**: Provides structural hierarchy - **blocks contain lines and components**
- **Validation**: `format.isBlock(element)` - checks against `formatBlock` regex
- **Default Tags**: `BLOCKQUOTE`, `OL`, `UL`, `FIGCAPTION`, `TABLE`, `THEAD`, `TBODY`, `TR`, `CAPTION`, `DETAILS`
- **Relationship**: Blocks structurally contain lines (e.g., `<blockquote><p>quoted text</p></blockquote>`)
- **Subtypes**:
    - **Normal Block** (`format.isBlock()` but not closure): Standard structural containers
        - Can be exited: Pressing Enter/Backspace at edges exits the block
    - **Closure Block** (`format.isClosureBlock()`): Constrained blocks that trap cursor
        - Tags: `TH`, `TD` (table cells)
        - Cannot be exited: Enter/Backspace always stays within the block

**Special Case: Lists (OL/UL/LI)**

Lists are a special Block-Line combination where:

- **List Container** (`OL`, `UL`): Block-level elements
- **List Item** (`LI`): Line-level elements that can ONLY exist inside list containers
- **Dedicated Class**: `listFormat.js` handles list-specific operations (nesting, indentation, merging)
- **Common Checks**: `dom.check.isList()`, `dom.check.isListCell()`

#### **3. Component**

- **Definition**: Self-contained interactive elements (images, videos, tables, embedded content)
- **Purpose**: Rich media and special features - **same level as line** (not contained in line)
- **Validation**: `component.is(element)` - checks for component plugins
- **Container**: Components **must** have `se-component` or `se-flex-component` class at the top level
    - **Images, Videos**: `<div class="se-component"><figure><img|iframe|video></figure></div>`
    - **Tables**: `<figure class="se-flex-component"><table>...</table></figure>`
    - **Audio, File uploads**: `<div class="se-component se-flex-component"><figure><audio|a></figure></div>`
- **Examples**: Images, videos, audio, tables, drawings

#### **3.1. Inline Component** (Special Case)

- **Definition**: Components that exist **inside** lines (exception to the component-line sibling rule)
- **Validation**: `component.isInline(element)` - checks for `se-inline-component` class
- **Container**: Uses `<span class="se-component se-inline-component">` wrapper
- **Examples**: Math formulas, inline anchors

**Key Design Rules:**

1. **Mandatory State**: Every position must be in exactly one of: `line`, `block`, `component`, or `inline-component`
2. **Hierarchy**: `block` → contains → `line` (structural containment)
3. **Siblings**: **Block components** and `line` exist at the same hierarchy level
4. **Inline Exception**: **Inline components** can exist inside a `line`
5. **Block Wrapping**: Blocks provide structure by wrapping multiple lines

**Example Structure:**

```html
<div class="se-wrapper-wysiwyg">
	<p>
		Line 1: text with <span class="se-component se-inline-component"><katex>E=mc^2</katex></span> formula
	</p>
	<blockquote>
		<p>Line 2: quoted text</p>
	</blockquote>
	<div class="se-component">
		<figure><img src="..." /></figure>
	</div>
	<ul>
		<li>Line 3: list item</li>
		<li>Line 4: list item</li>
	</ul>
</div>
```

#### Content Filtering: strictMode

The `strictMode` option controls how strictly SunEditor validates and cleans HTML content.

**Configuration:**

```javascript
SUNEDITOR.create('editor', {
	// Enable all filters (default)
	strictMode: true,

	// Granular control
	strictMode: {
		tagFilter: true,
		formatFilter: true,
		classFilter: true,
		textStyleTagFilter: true,
		attrFilter: true,
		styleFilter: true,
	},
});
```

| Filter                   | Purpose                                         | When Disabled                    |
| ------------------------ | ----------------------------------------------- | -------------------------------- |
| **`tagFilter`**          | Removes disallowed HTML tags                    | Allows any tags (security risk)  |
| **`formatFilter`**       | Enforces line/block/component structure         | Components may not wrap properly |
| **`classFilter`**        | Validates CSS classes                           | Allows any CSS classes           |
| **`textStyleTagFilter`** | Converts `<B>`, `<I>`, `<U>` to styled `<SPAN>` | Keeps original tags              |
| **`attrFilter`**         | Filters attributes                              | Allows any attributes (XSS risk) |
| **`styleFilter`**        | Filters inline styles                           | Allows any inline styles         |

### Multi-Root Architecture

SunEditor uses a unified frame architecture for both single and multi-root editing.

**Data Storage Structure:**

```
editor
├── $.frameRoots (Map<rootKey, FrameContext>)  ← Actual data storage
│   ├── null → FrameContext              [Single-root: rootKey is null]
│   ├── rootKey1 → FrameContext1         [Multi-root]
│   └── rootKey2 → FrameContext2
│
├── $.context (ContextMap)               ← Global shared UI
├── $.frameContext (FrameContextMap)      ← Current frame pointer
├── $.frameOptions (FrameOptionsMap)     ← Current frame options pointer
└── $.options (BaseOptionsMap)           ← Shared config
```

**Key Concepts:**

1. **Unified Structure**: Single-root (`store.get('rootKey') === null`) and multi-root use the same architecture
2. **frameRoots Map**: Actual storage of all frame contexts
3. **Global Context** (`$.context`): Shared UI elements (toolbar, statusbar, modal overlay)
4. **Current Frame References**: `$.frameContext` and `$.frameOptions` are pointers, updated by `changeFrameContext(rootKey)`
5. **Frame switching**: `editor.changeFrameContext(rootKey)` updates `store.rootKey` and resets pointers

### Plugin System (`src/plugins/`)

Plugins are modular features that extend editor functionality.

**Architecture Pattern**: ES6 classes extending plugin type base classes from `src/interfaces/plugins.js`, which extend `KernelInjector`.

**Inheritance Chain:**

```
KernelInjector → Base → PluginCommand/PluginModal/PluginDropdown/...
                         ↓
                    constructor(kernel) → super(kernel) → this.$ = kernel.$
```

**Plugin Type Base Classes:**

| Base Class               | Type            | Required Methods    | Examples                    |
| ------------------------ | --------------- | ------------------- | --------------------------- |
| **`PluginCommand`**      | `command`       | `action()`          | blockquote, list, exportPDF |
| **`PluginDropdown`**     | `dropdown`      | `action()`          | align, font, blockStyle     |
| **`PluginDropdownFree`** | `dropdown-free` | (none)              | table                       |
| **`PluginModal`**        | `modal`         | `open()`            | image, video, link, math    |
| **`PluginBrowser`**      | `browser`       | `open()`, `close()` | imageGallery, videoGallery  |
| **`PluginField`**        | `field`         | (none)              | mention                     |
| **`PluginInput`**        | `input`         | (none)              | fontSize, pageNavigator     |
| **`PluginPopup`**        | `popup`         | `show()`            | anchor                      |

**Plugin Access Pattern:**

All plugins access dependencies through `this.$`:

```javascript
import { PluginModal } from '../../interfaces';

class MyPlugin extends PluginModal {
	static key = 'myPlugin';
	static className = 'se-btn-my-plugin';

	constructor(editor, pluginOptions) {
		super(editor);
		this.title = this.$.lang.myPlugin; // language string
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

**Available via `this.$`:**

- **Config**: `options`, `frameOptions`, `context`, `frameContext`, `frameRoots`, `lang`, `icons`
- **DOM Logic**: `selection`, `html`, `format`, `inline`, `listFormat`, `nodeTransform`, `char`, `offset`
- **Shell Logic**: `component`, `focusManager`, `pluginManager`, `plugins`, `ui`, `commandDispatcher`, `history`, `shortcuts`
- **Panel Logic**: `toolbar`, `subToolbar`, `menu`, `viewer`
- **Services**: `eventManager`, `contextProvider`, `optionProvider`, `instanceCheck`, `store`
- **Environment**: `facade` (editor instance), `_w` (Window), `_d` (Document)

---

#### Plugin Methods Reference

Plugin methods are organized into three categories:

1. **Interface Methods** - Type-specific methods defined by plugin base classes
2. **Common Hooks** - Lifecycle and event hooks available to ALL plugins
3. **Module Hooks** - Hooks for plugins using specific modules (Modal, Controller, etc.)

> **Legend:**
>
> - Required | Optional
> - Very common | Moderate | Rare

---

##### 1. Module Hooks (When Using Modules)

Interface definitions: [`src/interfaces/contracts.js`](src/interfaces/contracts.js)

###### Modal Module — Interface: `ModuleModal`

| Hook                 | Required | When Called             | Return             |
| -------------------- | -------- | ----------------------- | ------------------ |
| `modalAction()`      | Required | Form submit             | `Promise<boolean>` |
| `modalOn(isUpdate)`  | Optional | After modal opens       | `void`             |
| `modalOff(isUpdate)` | Optional | After modal closes      | `void`             |
| `modalInit()`        | Optional | Before modal open/close | `void`             |
| `modalResize()`      | Optional | Modal window resized    | `void`             |

###### Controller Module — Interface: `ModuleController`

| Hook                         | Required | When Called              | Return |
| ---------------------------- | -------- | ------------------------ | ------ |
| `controllerAction(target)`   | Required | Controller button click  | `void` |
| `controllerOn(form, target)` | Optional | After controller opens   | `void` |
| `controllerClose()`          | Optional | Before controller closes | `void` |

###### ColorPicker Module — Interface: `ModuleColorPicker`

| Hook                          | Required | When Called               | Return |
| ----------------------------- | -------- | ------------------------- | ------ |
| `colorPickerAction(color)`    | Optional | Color selected            | `void` |
| `colorPickerHueSliderOpen()`  | Optional | Before hue slider opens   | `void` |
| `colorPickerHueSliderClose()` | Optional | When hue slider cancelled | `void` |

###### HueSlider Module — Interface: `ModuleHueSlider`

| Hook                      | Required | When Called              | Return |
| ------------------------- | -------- | ------------------------ | ------ |
| `hueSliderAction(color)`  | Required | Color selected in slider | `void` |
| `hueSliderCancelAction()` | Optional | Hue slider cancelled     | `void` |

---

##### 2. Component Hooks — Interface: `EditorComponent`

For plugins that create **static components** (e.g., image, video, embed) using `this.$.component.setInfo()`.

**`static component(node)` Method:**

Component plugins must define a static `component` method that identifies whether a DOM node belongs to this plugin.

```javascript
class MyComponentPlugin extends PluginModal {
	static component(node) {
		return /^IMG$/i.test(node?.nodeName) ? node : null;
	}
}
```

**`_element` Property Requirement:**

Component plugins must define a public `_element` property that references the currently controlled DOM element.

| Hook                        | Required | When Called                 | Return            |
| --------------------------- | -------- | --------------------------- | ----------------- |
| `componentSelect(target)`   | Required | Component selected          | `void \| boolean` |
| `componentDeselect(target)` | Optional | Component deselected        | `void`            |
| `componentEdit(target)`     | Optional | Component edit button click | `void`            |
| `componentDestroy(target)`  | Optional | Component delete            | `Promise<void>`   |
| `componentCopy(params)`     | Optional | Copy event                  | `boolean \| void` |

##### 3. Common Hooks (All Plugins)

These hooks from `src/hooks/base.js` can be implemented by **any plugin type**.

| Hook                      | When Called                          | Return                 |
| ------------------------- | ------------------------------------ | ---------------------- |
| `active(element, target)` | Selection change                     | `boolean \| undefined` |
| `init()`                  | Editor initialization / resetOptions | `void`                 |
| `retainFormat()`          | HTML cleaning/validation             | `{query, method}`      |
| `shortcut(params)`        | Shortcut key triggered               | `void`                 |
| `setDir(dir)`             | RTL direction change                 | `void`                 |

###### Event Hooks

> - Has async variant using same method name
> - Interruptible event (returning boolean stops event loop and prevents default behavior)

| Hook                 | When Called          | Return            |
| -------------------- | -------------------- | ----------------- |
| `onKeyDown`          | Key down in editor   | `boolean \| void` |
| `onKeyUp`            | Key up in editor     | `boolean \| void` |
| `onMouseDown`        | Mouse down in editor | `boolean \| void` |
| `onClick`            | Click in editor      | `boolean \| void` |
| `onPaste`            | Paste event          | `boolean \| void` |
| `onBeforeInput`      | Before input event   | `boolean \| void` |
| `onInput`            | Editor content input | `boolean \| void` |
| `onMouseUp`          | Mouse up in editor   | `boolean \| void` |
| `onMouseLeave`       | Mouse leave editor   | `boolean \| void` |
| `onMouseMove`        | Mouse move in editor | `void`            |
| `onScroll`           | Editor scroll        | `void`            |
| `onFocus`            | Editor focus         | `void`            |
| `onBlur`             | Editor blur          | `void`            |
| `onFilePasteAndDrop` | File paste/drop      | `boolean \| void` |

**Event Hook Return Values:**

- `false` - Stops remaining plugins + prevents default editor behavior
- `true` - Stops remaining plugins + allows default editor behavior
- `void`/`undefined` - Continues to next plugin

---

#### Hook Parameter Types

Many hook methods receive standardized parameter objects defined in [`src/hooks/params.js`](src/hooks/params.js).

**Common Parameter Types:**

| Type                                 | Properties                                 | Used By                                                              |
| ------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------- |
| **`HookParams.MouseEvent`**          | `{ frameContext, event }`                  | `onMouseDown`, `onMouseUp`, `onClick`, `onMouseMove`, `onMouseLeave` |
| **`HookParams.KeyEvent`**            | `{ frameContext, event, range, line }`     | `onKeyDown`, `onKeyUp`                                               |
| **`HookParams.FocusBlur`**           | `{ frameContext, event }`                  | `onFocus`, `onBlur`                                                  |
| **`HookParams.Scroll`**              | `{ frameContext, event }`                  | `onScroll`                                                           |
| **`HookParams.InputWithData`**       | `{ frameContext, event, data }`            | `onBeforeInput`, `onInput`                                           |
| **`HookParams.Paste`**               | `{ frameContext, event, data, doc }`       | `onPaste`                                                            |
| **`HookParams.FilePasteDrop`**       | `{ frameContext, event, file }`            | `onFilePasteAndDrop`                                                 |
| **`HookParams.ToolbarInputKeyDown`** | `{ target, event }`                        | `toolbarInputKeyDown`                                                |
| **`HookParams.ToolbarInputChange`**  | `{ target, event, value }`                 | `toolbarInputChange`                                                 |
| **`HookParams.Shortcut`**            | `{ range, line, info, event, keyCode, $ }` | `shortcut`                                                           |
| **`HookParams.CopyComponent`**       | `{ event, cloneContainer, info }`          | `componentCopy`                                                      |

---

### Modules (`src/modules/`)

**Architecture Pattern**: ES6 classes that receive `$` (Deps) directly — **no inheritance from KernelInjector**.

- Constructor: `constructor(inst, $, ...)` → receives plugin instance + deps + custom params
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
| **`ApiManager`**        | `manager/`  | XHR requests         | Static only                        |
| **`SelectMenu`**        | `ui/`       | Custom dropdowns     | Instance + items                   |
| **`ModalAnchorEditor`** | `ui/`       | Link form            | Instance + form                    |
| **`_DragHandle`**       | `ui/`       | Drag state           | Map (not class)                    |

### Helper Utilities (`src/helper/`)

**Architecture Pattern**: Pure functions, no classes or state

- Export: `export function funcName()` + `export default { funcName }`
- Can be imported as `import { dom } from '../helper'` → `dom.check.isElement()`

**Helper Modules:**

| Module                | Key Functions                                                     | Purpose                        |
| --------------------- | ----------------------------------------------------------------- | ------------------------------ |
| **`converter.js`**    | `htmlToEntity`, `htmlToJson`, `debounce`, `toFontUnit`, `rgb2hex` | String/HTML conversion         |
| **`env.js`**          | `isMobile`, `isOSX_IOS`, `isClipboardSupported`, `_w`, `_d`       | Browser/device detection       |
| **`keyCodeMap.js`**   | `isEnter`, `isCtrl`, `isArrow`, `isComposing`                     | Keyboard event checking        |
| **`numbers.js`**      | `is`, `get`, `isEven`, `isOdd`                                    | Number validation              |
| **`unicode.js`**      | `zeroWidthSpace`, `escapeStringRegexp`                            | Special characters             |
| **`clipboard.js`**    | `write`                                                           | Clipboard with iframe handling |
| **`dom/domCheck.js`** | `isElement`, `isText`, `isWysiwygFrame`, `isComponentContainer`   | Node type checking             |
| **`dom/domQuery.js`** | `getParentElement`, `getChildNode`, `getNodePath`                 | DOM tree navigation            |
| **`dom/domUtils.js`** | `addClass`, `createElement`, `setStyle`, `removeItem`             | DOM operations                 |

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
npm run test:e2e        # Run Playwright E2E tests (requires dev server)
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
- Access deps directly from kernel → Use `this.$` (the Deps bag)

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
options.plugins: [ImagePlugin, VideoPlugin, ...]
         ↓
Constructor.js: stores as class references in product.plugins
         ↓
CoreKernel → PluginManager: loops through plugins
         ↓
new Plugin(kernel, options) → super(kernel) → KernelInjector → this.$ = kernel.$
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
- `src/core/event/effects/keydown.registry.js` - Keydown effect handlers

**Example Event Flow (Enter Key):**

```
1. User presses Enter
   ↓
2. handler_ww_key.js captures keydown event
   ↓
3. keydown.reducer.js analyzes the event with current editor state
   ↓
4. Returns action list: [{t: 'enter.line.addDefault', p: {...}}, {t: 'history.push', p: {...}}]
   ↓
5. Effects from keydown.registry.js execute:
   - 'enter.line.addDefault' → calls format.addLine()
   - 'history.push' → calls history.push()
   ↓
6. DOM updated, selection adjusted, onChange event triggered
```

---

## Testing Strategy

### Unit Tests (`test/unit/`)

- Jest with jsdom environment
- Test individual functions and components in isolation
- Module path alias: `@/` maps to `src/`
- Coverage thresholds: 62% statements, 53% branches, 75% functions, 63% lines

### Integration Tests (`test/integration/`)

- Jest-based integration tests for cross-component functionality

### E2E Tests (`test/e2e/`)

- Playwright tests running against local dev server
- Run on Chromium by default

---

## Initialization: `onload` Event

Editor initialization completes **asynchronously**. Always use `onload` for post-init operations:

```javascript
// Wrong - may fail
const editor = SUNEDITOR.create('editor');
editor.focusManager.focus();

// Correct
SUNEDITOR.create('editor', {
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
SUNEDITOR.create('editor', {
	iframe: true,
	iframe_attributes: {
		sandbox: 'allow-downloads', // allow-same-origin is auto-added
	},
});
```

**SSR frameworks (Next.js/Nuxt):** Use dynamic import with `ssr: false` to avoid `contentDocument is null` errors.

---

## Build System

- **Webpack** for bundling (config in `webpack/`)
- **Babel** for transpilation to ES2022 baseline
- **ESLint** with Prettier for code quality
- **Output**: `dist/suneditor.min.js` and `dist/suneditor.min.css`

The `dist/` folder is NOT tracked in git and is built via CI/CD.

---

## Supplementary Guides

- [External Libraries](./guide/external-libraries.md) - CodeMirror, KaTeX, MathJax integration
- [Type Definitions](./guide/typedef-guide.md) - SunEditor namespace types reference
