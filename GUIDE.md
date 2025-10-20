# GUIDE.md

> **Purpose:**
> This document serves as a unified reference for both human developers and AI agents (e.g., Claude, Gemini, ChatGPT) working on this repository.
> It defines the project's architecture, conventions, and development workflow, ensuring consistency and shared understanding between human contributors and AI-based coding assistants.

---

## Table of Contents

### Quick Navigation

- [Overview](#-overview)
- [How to Use This Guide](#how-ai-agents-should-use-this-file)
- [Project Overview](#project-overview)
- [Directory Structure](#directory-structure)
- [Technical Requirements](#technical-requirements)

### Architecture

- [Overall Architecture](#overall-architecture)
- [Content Structure Design](#content-structure-design)
- [Multi-Root Architecture](#multi-root-architecture)
- [Core Components](#core-components-srccore)
- [Plugin System](#plugin-system-srcplugins)
- [Modules](#modules-srcmodules)
- [Helper Utilities](#helper-utilities-srchelper)
- [EditorInjector Pattern](#editorinjector-pattern-srceditorinjector)
- [Options System](#options-system)
- [Context System](#context-system)
- [Type System](#type-system)

### Development

- [Essential Commands](#essential-commands)
- [Naming Conventions](#naming-conventions)
- [Common Pitfalls](#common-pitfalls)
- [Plugin Registration Flow](#plugin-registration-flow)
- [Common Development Patterns](#common-development-patterns)
- [Example Implementations](#example-implementations)
- [Testing Strategy](#testing-strategy)
- [Build System](#build-system)

---

## 🧭 Overview

This file functions as:

- A **source of context** for AI agents performing code analysis, refactoring, or documentation assistance.
- A **technical guide** for developers contributing to the project, describing its structure, tools, and workflows.
- A **living document** that evolves alongside the codebase to keep both human and AI collaborators aligned.

---

## 📘 How AI Agents Should Use This File

- Treat this document as the **primary entry point** for understanding the repository.
- Use it to interpret project conventions, dependencies, and development practices.
- When uncertain about file purposes, naming, or patterns, consult this guide before making assumptions.
- Avoid modifying this document automatically unless explicitly instructed.

---

## 👩‍💻 How Developers Should Use This File

- Use it as an **onboarding guide** to understand the architecture and workflow.
- Follow the conventions and structures outlined here when adding new components, locales, or documentation.
- Keep this guide updated whenever major architectural or tooling changes occur.
- When integrating AI tools, configure them to reference this file for repository context.

---

---

## Project Overview

SunEditor is a lightweight, fast WYSIWYG editor written in pure vanilla JavaScript (ES2022+) with no dependencies.  
It uses JSDoc for type definitions and TypeScript for type checking.  
The editor supports a modular plugin architecture where features can be enabled/disabled as needed.

**Architecture Components:**

- **Core**: selection, html, format, inline, toolbar, etc.
- **Plugins**: image, video, link, table, mention, etc.
- **Modules**: Modal, Controller, Figure, ColorPicker, etc.
- **Helpers**: DOM utilities, converters, env detection
- **Events**: onChange, onImageUpload, onSave, etc.

## Directory Structure

```
suneditor/
├── src/                      # Source code
│   ├── suneditor.js         # Factory entry point (create, init)
│   ├── events.js            # User event definitions (onChange, onImageUpload, etc.)
│   ├── typedef.js           # JSDoc type definitions
│   ├── core/                # Editor core functionality
│   │   ├── editor.js        # Main Editor class (orchestration, plugin lifecycle, multi-root)
│   │   ├── class/           # Operational classes (selection, html, format, inline, etc.)
│   │   ├── config/          # Context & options management
│   │   ├── event/           # Redux-like event system (handlers, reducers, effects)
│   │   ├── base/            # History & commands
│   │   ├── section/         # DOM construction
│   │   └── util/            # Core utilities (instanceCheck)
│   ├── plugins/             # Modular features
│   │   ├── command/         # Direct actions (blockquote, list, exportPDF)
│   │   ├── dropdown/        # Dropdown menus (align, font, formatBlock, table)
│   │   ├── modal/           # Dialog plugins (image, video, link, math)
│   │   ├── browser/         # Gallery plugins (imageGallery, videoGallery)
│   │   ├── field/           # Autocomplete (mention)
│   │   ├── input/           # Toolbar inputs (fontSize, pageNavigator)
│   │   └── popup/           # Inline controllers (anchor)
│   ├── modules/             # UI components (Modal, Controller, Figure, ColorPicker, etc.)
│   ├── helper/              # Pure utility functions
│   │   ├── converter.js     # String/HTML conversion
│   │   ├── env.js           # Browser/device detection
│   │   ├── keyCodeMap.js    # Keyboard event checking
│   │   ├── numbers.js       # Number validation
│   │   ├── unicode.js       # Special characters
│   │   ├── clipboard.js     # Clipboard API
│   │   └── dom/             # DOM utilities (check, query, utils)
│   ├── editorInjector/      # Dependency injection pattern
│   ├── assets/              # Static assets
│   │   ├── icons/           # SVG string icons
│   │   ├── design/          # Design resources
│   │   └── *.css            # Core CSS files (suneditor.css, suneditor-contents.css)
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
- **Legacy syntax**: Core directory (`src/core/`) still use constructor functions, migration to ES6 classes planned

    ```javascript
    // Example: selection.js
    function Selection_(editor) {
    	CoreInjector.call(this, editor);
    	this.range = null;
    	this.selectionNode = null;
    }

    Selection_.prototype = {
    	get() {
    		/* ... */
    	},
    	getRange() {
    		/* ... */
    	},
    	setRange() {
    		/* ... */
    	}
    };
    ```

    - Uses `function` + `prototype` instead of ES6 `class`
    - Dependency injection via `CoreInjector.call(this, editor)`

**Development Environment:**

- **Node.js**: 22 recommended, minimum 14+
- **npm**: 11 recommended
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
┌────────────────────────────────────────────────────────────────────────┐               ┌──────────────┐
│                            suneditor.js                                │               │ Helper Utils │
│                         (Factory Entry Point)                          │               └──────┬───────┘
│  • create(target, options) → new Editor()                              │                      │
│  • init(options) → { create() }                                        │                      │(stateless)
└───────────────────────────────┬────────────────────────────────────────┘                      ▼
                                │ creates                                                 ┌───────────┐
                                │                                                         │ dom.*     │
                                ▼                                                         │ • check,  │
┌─────────────────────────────────────────────────────────────────────────────┐           │ • query   │
│                            editor.js                                        │           │ • utils   │
│                     (Main Editor Class Instance)                            │           │ converter │
│                                                                             │           │ env       │
│  Public API: focus/blur, html.get/set, run, registerPlugin...               │           │ unicode   │
│                                                                             │           │ keyboard  │
│  Internal Management:                                                       │           | numbers   │
│  • Multi-root frame contexts (frameRoots Map)                               │           | clipboard │
│  • Two-tier options (Base + Frame Options Map)                              │           └───────────┘
│  • Plugin lifecycle (load → init → on/off)                                  │
│  • Command execution routing                                                │
│  • History stack coordination                                               │
└─┬────────────┬──────────────────┬───────────────────────┬────────────────┬──┘
  │            │                  │                       │                │
  │injects     │manages           │manages                │coordinates     │manages
  │            │                  │                       │                │
  ▼            ▼                  ▼                       ▼                ▼
┌──────┐   ┌────────┐       ┌──────────────┐        ┌────────────┐    ┌─────────┐
│ Core │   │ Plugin │       │   Context    │        │   Event    │    │ History │
│Class │   │ System │       │  & Options   │        │  Manager   │    │ Manager │
└──┬───┘   └───┬────┘       └──────┬───────┘        └─────┬──────┘    └────┬────┘
   │           │                   │                      │                │
   │           │                   │                      │                │
   │           ▼                   ▼                      ▼                ▼
   │    ┌────────────┐  ┌──────────────────────┐    ┌────────────┐    ┌─────────┐
   │    │ command/   │  │ context              │    │ Redux      │    │ Stack   │
   │    │ dropdown/  │  │  Map (Global UI)     │    │ Pattern:   │    │ based:  │
   │    │ modal/     │  │  • toolbar           │    │ Reducer    │    │ push()  │
   │    │ browser/   │  │  • statusbar         │    │ → Action   │    │ undo()  │
   │    │ field/     │  │  • modalOverlay      │    │ → Effect   │    │ redo()  │
   │    │ input/     │  │                      │    │            │    │ reset() │
   │    │ popup/     │  │ frameContext         │    │ handlers/  │    │         │
   │    └─────┬──────┘  │  → current frame     │    │ reducers/  │    └─────────┘
   │          │         │                      │    │ effects/   │
   │          │         │ frameOptions         │    └────────────┘
   │          │         │  → current opts      │
   │          │         │                      │
   │          │         │ options              │
   │          │         │  Map (Base Cfg)      │
   │          │         │                      │
   │          │         │ frameRoots           │
   │          │         │  Map<rootKey,        │
   │          │         │   FrameContext>      │
   │          │uses     │  (All FrameContext)  │
   │          ▼         └──────────────────────┘
   │     ┌───────────┐
   │     │ Modules   │ (UI Components)
   │     ├───────────┤
   │     │ Modal     │ ← modal plugins
   │     │ Contrllr  │ ← component plugins
   │     │ Figure    │ ← image/video/audio
   │     │ SelectMnu │ ← font/formatBlock
   │     │ ColorPckr │ ← fontColor/bgColor
   │     │ FileMngr  │ ← file upload plugins
   │     │ Browser   │ ← gallery plugins
   │     │ Anchor    │ ← link plugin
   │     └───────────┘
   │
   ▼ (all extend EditorInjector)
┌────────────────────────────────────────┐
│        Core Classes                    │
│  Injected into all plugins & classes   │
├────────────────────────────────────────┤
│ Content:    selection, html, format,   │
│             inline, listFormat,        │
│             component                  │
│ UI:         toolbar, menu, ui, viewer  │
│ Utilities:  offset, char, shortcuts,   │
│             nodeTransform              │
└────────────────────────────────────────┘
```

**Initialization Flow:**

1. **suneditor.create()** → Validates target, merges options
2. **new Editor()** → Creates editor instance
3. **Constructor()** → Builds DOM (toolbar, statusbar, wysiwyg frames)
4. **\_\_registerClass()** → Instantiates core classes (selection, html, etc.)
5. **\_\_init()** → Registers plugins, sets up event handlers
6. **\_\_editorInit()** → Initializes frames, triggers `onload` event

**Data Flow:**

```
1. Wysiwyg User Action (typing, paste, etc.):
   User Action → EventManager → Reducer → Actions → Effects → Core Classes
                                                                  ↓
                                                            [Plugin action]
                                                                  ↓
                                                             DOM Update
                                                                  ↓
                                                           History Push
                                                                  ↓
                                                      Trigger onChange Event
```

**Key Architectural Decisions:**

1. **Layered Architecture**
    - **editor.js**: **&lt;Root&gt;** Orchestration layer (public API, plugin lifecycle, frame management, history coordination, event delegation)
        - Integrates **eventManager** (event registration, DOM delegation, tag effects) - `src/core/event/eventManager.js`
        - Integrates **history** (undo/redo stack management) - `src/core/base/history.js`
        - Manages **Core Classes** (operational classes via ClassInjector) - `src/core/class/`
    - **Core Classes**: Operation layer (content manipulation, UI state, positioning)
        - `selection`, `html`, `format`, `inline`, `listFormat`, `component`
        - `toolbar`, `menu`, `ui`, `viewer`, `offset`, `char`, `shortcuts`, `nodeTransform`
    - **Plugins**: Feature layer (user-facing functionality)
    - **Modules**: UI Component layer (reusable widgets)
    - **Helpers**: Utility layer (pure functions, no state)

2. **Dependency Injection via EditorInjector**
    - Plugins extend `EditorInjector` to access editor API and core classes
    - See [EditorInjector Pattern](#editorinjector-pattern-srceditorinjector) for implementation details

3. **Multi-Root Frame Architecture**
    - **frameRoots Map**: Stores all frame contexts by rootKey (actual data storage)
    - **Global Context** (`editor.context`): Shared UI (toolbar, statusbar, modal overlay)
    - **Current Frame References**:
        - `editor.frameContext` → Points to current frame's context in frameRoots
        - `editor.frameOptions` → Points to current frame's options (from frameContext.get('options'))
    - Single editor instance manages multiple editable frames

4. **Two-Tier Options System**
    - **Base Options** (`editor.options`): Shared config (plugins, mode, toolbar, shortcuts, events)
    - **Frame Options** (`editor.frameOptions`): Per-frame config (height, placeholder, iframe, statusbar)
    - Map-based storage with `'fixed'` flags for immutable options
    - Dynamic updates via `editor.resetOptions()` for resettable options

5. **Event-Driven with Redux Pattern**
    - **Reducers**: Pure functions analyzing events → return action lists
    - **Actions**: Plain objects `{t: 'ACTION_TYPE', p: payload}`
    - **Effects**: Side effect functions mapped by action type
    - **Handlers**: DOM event listeners delegating to reducers

---

### Content Structure Design

SunEditor's content is organized into **three fundamental units** with exactly **one state being mandatory** at any position:

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
- **Purpose**: Provides structural hierarchy - **blocks contain lines**
- **Validation**: `format.isBlock(element)` - checks against `formatBlock` regex
- **Default Tags**: `BLOCKQUOTE`, `OL`, `UL`, `FIGCAPTION`, `TABLE`, `THEAD`, `TBODY`, `TR`, `CAPTION`, `DETAILS`
- **Relationship**: Blocks structurally contain lines (e.g., `<blockquote><p>quoted text</p></blockquote>`)
- **Subtypes**:
    - **Normal Block** (`format.isBlock()` but not closure): Standard structural containers
        - Tags: `BLOCKQUOTE`, `OL`, `UL`, `FIGCAPTION`, `TABLE`, `THEAD`, `TBODY`, `TR`, `CAPTION`, `DETAILS`
        - Can be exited: Pressing Enter/Backspace at edges exits the block
        - Example: `<blockquote><p>Quote</p></blockquote>` → Enter at end creates `<p>` outside
    - **Closure Block** (`format.isClosureBlock()`): Constrained blocks that trap cursor
        - Tags: `TH`, `TD` (table cells)
        - Cannot be exited: Enter/Backspace always stays within the block
        - Example: Table cells where Enter creates new line/BR inside cell, never exits

#### **3. Component**

- **Definition**: Self-contained interactive elements (images, videos, tables, embedded content)
- **Purpose**: Rich media and special features - **same level as line** (not contained in line)
- **Validation**: `component.is(element)` - checks for component plugins
- **Relationship**: Components exist at the **same hierarchy level as lines**, not inside them
- **Container**: Components **must** have `se-component` or `se-flex-component` class at the top level
    - **Images, Videos**: `<div class="se-component"><figure><img|iframe|video></figure></div>`
    - **Tables**: `<figure class="se-flex-component"><table>...</table></figure>`
    - **Audio, File uploads**: `<div class="se-component se-flex-component"><figure><audio|a></figure></div>`
    - **Math, Drawing, Embed**: Typically `<div class="se-component"><figure>...</figure></div>`
- **Examples**: Images, videos, audio, tables, math formulas, drawings

**Key Design Rules:**

- Every position must be in exactly one state: `line`, `block`, or `component`
- Blocks contain lines; components and lines are siblings (never parent-child)
- Components cannot be inside lines

1. **Mandatory State**: Every content position must be in exactly one of: `line`, `block`, or `component`
2. **Hierarchy**: `block` → contains → `line` (structural containment)
3. **Same Level**: `component` and `line` exist at the same hierarchy level
4. **Never Mixed**: A `line` cannot contain a `component` (they're siblings, not parent-child)
5. **Block Wrapping**: Blocks provide structure by wrapping multiple lines or components

**Example Structure:**

```html
<div class="se-wrapper-wysiwyg">
	<p>Line 1: text content</p>
	<!-- line -->
	<blockquote>
		<!-- block -->
		<p>Line 2: quoted text</p>
		<!--   └─ line (inside block) -->
	</blockquote>
	<div class="se-component">
		<!-- component: image (same level as line) -->
		<figure>
			<img src="..." />
		</figure>
	</div>
	<figure class="se-flex-component">
		<!-- component: table (same level as line) -->
		<table>
			<tbody>
				<tr>
					<td>
						<!-- closure block -->
						<div>Cell 1</div>
					</td>
					<td><div>Cell 2</div></td>
				</tr>
			</tbody>
		</table>
	</figure>
	<ul>
		<!-- block -->
		<li>Line 3: list item</li>
		<!--   └─ line (inside block) -->
		<li>Line 4: list item</li>
		<!--   └─ line (inside block) -->
	</ul>
</div>
```

### Multi-Root Architecture

SunEditor v3 uses a unified frame architecture for both single and multi-root editing.

**Data Storage Structure:**

```
editor
├── frameRoots (Map<rootKey, FrameContext>)  ← Actual data storage
│   ├── null → FrameContext              [Single-root: rootKey is null]
│   ├── rootKey1 → FrameContext1         [Multi-root: custom rootKey]
│   │   ├── get('wysiwyg')
│   │   ├── get('options') → FrameOptions1 (Map)
│   │   └── ... per-frame state
│   ├── rootKey2 → FrameContext2
│   │   ├── get('wysiwyg')
│   │   ├── get('options') → FrameOptions2 (Map)
│   │   └── ... per-frame state
│   └── ...
│
├── context (ContextUtil)              ← Global shared UI
│   └── Wraps __context Map
│
├── frameContext (FrameContextUtil)    ← Current frame reference
│   └── Points to frameRoots.get(status.rootKey)
│
├── frameOptions (FrameOptionsMap)     ← Current frame options reference
│   └── Points to frameContext.get('options')
│
└── options (BaseOptionsMap)           ← Shared config
    └── Wraps __options Map
```

**Key Concepts:**

1. **Unified Structure**: Single-root and multi-root use the same architecture
    - **Single-root**: `editor.status.rootKey = null` (default)
    - **Multi-root**: `editor.status.rootKey = custom string` (user-defined)
2. **frameRoots Map**: Actual storage of all frame contexts (indexed by rootKey)
    - Single editor: `frameRoots.get(null)`
    - Multi editor: `frameRoots.get('frame1')`, `frameRoots.get('frame2')`, etc.
3. **Global Context** (`editor.context`): Shared UI elements (toolbar, statusbar, modal overlay)
4. **Current Frame References** (convenience pointers):
    - `editor.frameContext` → Points to `frameRoots.get(editor.status.rootKey)`
    - `editor.frameOptions` → Points to `frameContext.get('options')`
    - Updated automatically when switching frames via `changeFrameContext(rootKey)`
5. **Base Options** (`editor.options`): Shared configuration (plugins, mode, toolbar, shortcuts, events)

**Frame Context Contents:**

Each FrameContext Map in `frameRoots` contains:

- `options` - Per-frame FrameOptions (Map)
- `isCodeView`, `isReadOnly`, `isDisabled`, `isFullScreen` - State flags
- DOM references: `topArea`, `wysiwygFrame`, `placeholder`, `statusbar`, etc.

**Important Notes:**

- **Single-root mode** (default): `editor.status.rootKey = null`, single frame in `frameRoots.get(null)`
- **Multi-root mode**: Requires `toolbar_container` option when using "classic" mode
- Most plugins work with the current frame context automatically via `this.frameContext`
- `changeFrameContext(rootKey)` switches the current frame by updating `editor.status.rootKey` and resetting the `frameContext`/`frameOptions` references
- Internal core methods like `applyFrameRoots()` are used by the editor core to apply operations across all frames

### Core Components (`src/core/`)

The core directory provides the operational foundation for the editor. It contains the main editor class, configuration management, operational classes, and event handling system.

**Directory Structure:**

```
src/core/
├── editor.js              # Main Editor class (orchestration, plugin lifecycle, multi-root)
├── class/                 # Operational classes injected via ClassInjector
│   ├── selection.js       # Selection & range manipulation
│   ├── html.js            # HTML manipulation & sanitization
│   ├── format.js          # Block-level formatting (indent, lists, lines)
│   ├── inline.js          # Inline formatting (bold, italic, styles)
│   ├── listFormat.js      # List operations (create, edit, nested)
│   ├── component.js       # Component management (images, videos, etc.)
│   ├── toolbar.js         # Toolbar rendering & positioning
│   ├── menu.js            # Dropdown menu management
│   ├── ui.js              # UI state (loading, alerts, theme)
│   ├── viewer.js          # View modes (code view, fullscreen, preview)
│   ├── offset.js          # Position calculations for UI elements
│   ├── char.js            # Character counting & limits
│   ├── shortcuts.js       # Keyboard shortcut execution
│   └── nodeTransform.js   # DOM node transformations
├── config/                # Configuration and context management
│   ├── context.js         # Global context definition (toolbar, statusbar, modal)
│   ├── frameContext.js    # Per-frame context (wysiwyg, code, history, readonly)
│   └── options.js         # Options definitions (base + frame options)
├── event/                 # Redux-like event handling system
│   ├── eventManager.js    # Event registration, DOM event delegation, tag effects
│   ├── executor.js        # Action executor (runs effects based on actions)
│   ├── ports.js           # Event type definitions and constants
│   ├── handlers/          # DOM event listeners (toolbar, wysiwyg, clipboard, dragDrop)
│   ├── reducers/          # Event analyzers → return action lists
│   ├── rules/             # Keydown rules (enter, backspace, delete, tab, arrow)
│   ├── effects/           # Effect registries (keydown, common)
│   └── actions/           # Action type definitions
├── base/                  # Core editor functionality
│   ├── history.js         # Undo/redo history management
│   └── commands.js        # Built-in commands (bold, italic, etc.)
├── section/               # DOM construction
│   ├── constructor.js     # Editor DOM structure builder
│   └── documentType.js    # Document type handler (pagination, headers)
└── util/                  # Utilities
    └── instanceCheck.js   # Iframe-safe instanceof checks
```

### Plugin System (`src/plugins/`)

Plugins are modular features that extend editor functionality. Each plugin type serves a specific UI pattern.

**Architecture Pattern**: ES6 classes extending `EditorInjector`

- Constructor: `constructor(editor, pluginOptions)` → calls `super(editor)`
- Static properties: `static key`, `static type`, `static className`
- Full editor access via inherited properties: `this.editor`, `this.selection`, `this.html`, `this.format`, etc.
- Lifecycle controlled by editor and modules (Modal, Controller, etc.)

**Plugins organized by type:**

| Type            | Purpose               | Examples                        |
| --------------- | --------------------- | ------------------------------- |
| **`command/`**  | Direct actions, no UI | blockquote, list, exportPDF     |
| **`dropdown/`** | Dropdown menus        | align, font, formatBlock, table |
| **`modal/`**    | Dialog windows        | image, video, link, math        |
| **`browser/`**  | Gallery interfaces    | imageGallery, videoGallery      |
| **`field/`**    | Inline autocomplete   | mention                         |
| **`input/`**    | Toolbar input fields  | fontSize, pageNavigator         |
| **`popup/`**    | Inline controllers    | anchor                          |

**Key Differences from Core Classes:**

- **Plugins**: Feature implementation, extend `EditorInjector` (full editor access)
- **Core Classes**: Operational APIs, extend `EditorInjector` (full editor access)
- **Modules**: UI components, extend `CoreInjector` (minimal coupling)

#### Plugin Lifecycle Methods

Plugin methods marked with `@editorMethod` are lifecycle hooks called by specific editor components. The annotation indicates **who calls** the method:

**Core lifecycle methods:**

| Method                    | Called by             | When                                                        | Return                 | Required                       |
| ------------------------- | --------------------- | ----------------------------------------------------------- | ---------------------- | ------------------------------ |
| `active(element, target)` | `Editor.EventManager` | On selection change                                         | `boolean \| undefined` | Yes (command/dropdown only)    |
| `action()`                | `Editor.core`         | Button click or API call                                    | `void`                 | Yes (command plugins)          |
| `open()`                  | `Modules.Modal`       | Modal open request                                          | `void`                 | Yes (modal plugins)            |
| `close()`                 | `Modules.Modal`       | Modal close                                                 | `void`                 | Optional                       |
| `init()`                  | `Modules.Modal`       | Before modal open/close                                     | `void`                 | Optional                       |
| `on(isUpdate)`            | `Modules.Modal`       | After modal opens                                           | `void`                 | Optional                       |
| `on(target)`              | `Modules.Dropdown`    | After dropdown opens (note: different signature than modal) | `void`                 | Optional                       |
| `off(isUpdate)`           | `Modules.Modal`       | After modal closes                                          | `void`                 | Optional                       |
| `modalAction()`           | `Modules.Modal`       | Form submit                                                 | `Promise<boolean>`     | Yes (modal plugins with forms) |

**Component lifecycle methods:**

| Method                     | Called by                    | When                        | Return            | Required                        |
| -------------------------- | ---------------------------- | --------------------------- | ----------------- | ------------------------------- |
| `select(target)`           | `Editor.Component`           | Component selected          | `void`            | Yes (component plugins)         |
| `deselect()`               | `Editor.Component`           | Component deselected        | `void`            | Optional                        |
| `edit()`                   | `Modules.Controller(Figure)` | Component edit button click | `void`            | Yes (modal plugins with Figure) |
| `controllerAction(target)` | `Modules.Controller`         | Controller button click     | `void`            | Optional                        |
| `destroy(target)`          | `Editor.Component`           | Component delete            | `Promise<void>`   | Yes (component plugins)         |
| `show()`                   | `Editor.Component`           | Component shown             | `void`            | Optional                        |
| `retainFormat()`           | `Editor.core`                | HTML cleaning/validation    | `{query, method}` | Yes (component plugins)         |

**Event handler methods:**

| Method                                            | Called by             | When                 | Return             | Required                 |
| ------------------------------------------------- | --------------------- | -------------------- | ------------------ | ------------------------ |
| `onFilePasteAndDrop({file, event, frameContext})` | `Editor.EventManager` | File paste/drop      | `boolean \| void`  | Optional (modal plugins) |
| `onInput()`                                       | `Editor.EventManager` | Editor content input | `Promise<boolean>` | Optional (field plugins) |
| `onCopy(params)`                                  | `Editor.EventManager` | Copy event           | `boolean \| void`  | Optional (table plugin)  |
| `onPaste(params)`                                 | `Editor.EventManager` | Paste event          | `boolean \| void`  | Optional (table plugin)  |
| `onMouseDown(params)`                             | `Editor.EventManager` | Mouse down in editor | `void`             | Optional (table plugin)  |
| `onMouseUp()`                                     | `Editor.EventManager` | Mouse up in editor   | `void`             | Optional (table plugin)  |
| `onMouseMove(params)`                             | `Editor.EventManager` | Mouse move in editor | `void`             | Optional (table plugin)  |
| `onMouseLeave()`                                  | `Editor.EventManager` | Mouse leave editor   | `void`             | Optional (table plugin)  |
| `onScroll()`                                      | `Editor.EventManager` | Editor scroll        | `void`             | Optional (table plugin)  |
| `onKeyDown(params)`                               | `Editor.EventManager` | Key down in editor   | `void`             | Optional (table plugin)  |
| `onKeyUp(params)`                                 | `Editor.EventManager` | Key up in editor     | `void`             | Optional (table plugin)  |

**Module-specific callback methods:**

| Method                          | Called by             | When                     | Return | Required                 |
| ------------------------------- | --------------------- | ------------------------ | ------ | ------------------------ |
| `onColorChange(color)`          | `Modules.ColorPicker` | Color selected           | `void` | Optional (table plugin)  |
| `onToolbarInputKeyDown(params)` | `Editor.Toolbar`      | Keydown in toolbar input | `void` | Optional (input plugins) |
| `onToolbarInputChange(params)`  | `Editor.Toolbar`      | Toolbar input change     | `void` | Optional (input plugins) |

**Special plugin methods:**

| Method                                     | Called by             | When                   | Return | Required                   |
| ------------------------------------------ | --------------------- | ---------------------- | ------ | -------------------------- |
| `shortcut(params)`                         | `Editor.core`         | Shortcut key triggered | `void` | Optional (command plugins) |
| `updatePageNavigator(pageNum, totalPages)` | `Editor.documentType` | Page navigation update | `void` | Yes (pageNavigator only)   |
| `setDir(dir)`                              | `Editor.core`         | RTL direction change   | `void` | Optional (for RTL support) |

**Static Properties:**

All plugins must define:

- **`static key`** - Unique plugin identifier (string)
- **`static type`** - Plugin category (string)
- **`static className`** - CSS class for toolbar button (string)
- **`static component(node)?`** (optional) - Validates if node is this plugin's component

---

### Modules (`src/modules/`)

**Architecture Pattern**: ES6 classes extending `CoreInjector` (not `EditorInjector`)

- Constructor: `constructor(inst, ...)` → receives plugin instance + custom params
- Private fields: `#privateField` (ES2022 syntax)
- Static methods: `static MethodName()` for utilities
- Manually instantiated by plugins (not auto-registered)

**Module Classes:**

| Module                  | Purpose              | Pattern                   | Used By                    |
| ----------------------- | -------------------- | ------------------------- | -------------------------- |
| **`Modal`**             | Dialog windows       | Instance + callbacks      | modal plugins              |
| **`Controller`**        | Floating tooltips    | Instance + positioning    | component plugins          |
| **`Figure`**            | Resize/align wrapper | Instance + static helpers | image, video, audio        |
| **`SelectMenu`**        | Custom dropdowns     | Instance + items          | font, formatBlock          |
| **`ColorPicker`**       | Color palette        | Instance + callbacks      | fontColor, backgroundColor |
| **`HueSlider`**         | HSL color wheel      | Instance + attach         | ColorPicker                |
| **`FileManager`**       | File uploads         | Instance + async          | image, video, audio        |
| **`ApiManager`**        | XHR requests         | Static only               | Browser, mention           |
| **`ModalAnchorEditor`** | Link form            | Instance + form           | link, image                |
| **`Browser`**           | Gallery UI           | Instance + API            | imageGallery, videoGallery |
| **`_DragHandle`**       | Drag state           | Map (not class)           | component.js               |

**Key Differences:**

- **Plugins**: Feature implementation, extend `EditorInjector` (single-stage, full access)
- **Core Classes**: Operational APIs, use two-stage injection (CoreInjector → ClassInjector, full access)
- **Modules**: UI components, extend `CoreInjector` (minimal coupling)

### Helper Utilities (`src/helper/`)

**Architecture Pattern**: Pure functions, no classes or state

- Export: `export function funcName()` + `export default { funcName }`
- Accessible via `editor.helper.*` or direct imports
- Can be imported as `import { dom } from '../helper'` → `dom.check.isElement()`

**Helper Modules:**

| Module                | Category     | Key Functions                                                     | Purpose                        |
| --------------------- | ------------ | ----------------------------------------------------------------- | ------------------------------ |
| **`converter.js`**    | Transform    | `htmlToEntity`, `htmlToJson`, `debounce`, `toFontUnit`, `rgb2hex` | String/HTML conversion         |
| **`env.js`**          | Detection    | `isMobile`, `isOSX_IOS`, `isClipboardSupported`, `_w`, `_d`       | Browser/device capabilities    |
| **`keyCodeMap.js`**   | Event        | `isEnter`, `isCtrl`, `isArrow`, `isComposing`                     | Keyboard event checking        |
| **`numbers.js`**      | Parsing      | `is`, `get`, `isEven`, `isOdd`                                    | Number validation              |
| **`unicode.js`**      | Unicode      | `zeroWidthSpace`, `escapeStringRegexp`                            | Special characters             |
| **`clipboard.js`**    | API          | `write`                                                           | Clipboard with iframe handling |
| **`dom/domCheck.js`** | Validation   | `isElement`, `isText`, `isWysiwygFrame`, `isComponentContainer`   | Node type checking             |
| **`dom/domQuery.js`** | Traversal    | `getParentElement`, `getChildNode`, `getNodePath`                 | DOM tree navigation            |
| **`dom/domUtils.js`** | Manipulation | `addClass`, `createElement`, `setStyle`, `removeItem`             | DOM operations                 |

**Key Characteristics:**

- **Zero dependencies**: No external libraries
- **Iframe-safe**: DOM checks handle iframe context differences
- **Tree-shakeable**: Named exports for optimal bundling
- **Stateless**: Pure functions, no side effects (except DOM manipulation)

### EditorInjector Pattern (`src/editorInjector/`)

EditorInjector provides dependency injection for plugins, giving full access to editor APIs and core classes.

**Usage (Custom Plugins):**

```javascript
import EditorInjector from 'suneditor/src/editorInjector';

class MyCustomPlugin extends EditorInjector {
	constructor(editor, pluginOptions) {
		super(editor); // Injects all editor properties

		// Now you have access to:
		// - this.editor (main editor instance)
		// - this.selection, this.html, this.format (core classes)
		// - this.options, this.context, this.frameContext
		// - this.eventManager, this.history
		// - this.lang, this.icons, this._w, this._d
	}

	action() {
		// Use injected properties
		const range = this.selection.getRange();
		this.html.insert('<strong>Bold</strong>');
	}
}
```

**What EditorInjector Provides:**

- **Editor Instance**: `editor`, `eventManager`, `history`, `triggerEvent`
- **Core Classes**: `selection`, `html`, `format`, `inline`, `listFormat`, `component`, `toolbar`, `menu`, `ui`, `viewer`, `offset`, `char`, `shortcuts`, `nodeTransform`
- **Configuration**: `options`, `frameOptions`, `context`, `frameContext`, `frameRoots`
- **Utilities**: `lang`, `icons`, `plugins`, `status`, `instanceCheck`, `carrierWrapper`, `_w`, `_d`

### Options System

Options are split into two categories:

1. **Base Options** (`editor.options`): Shared across all frames (plugins, mode, toolbar, shortcuts, events)
2. **Frame Options** (`editor.frameOptions`): Per-frame configuration (width, height, placeholder, iframe, statusbar)

Options use Map-based storage. Some are marked `'fixed'` (immutable) or resettable via `editor.resetOptions()`.

### Context System

SunEditor uses a multi-layered context system to manage editor state and UI references:

**1. Global Context (`editor.context`)**

- **Type**: `ContextUtil` wrapper around `__context` Map
- **Purpose**: Shared UI elements across all frames
- **Contents**:
    - `toolbar` - Toolbar DOM element
    - `statusbar` - Statusbar DOM element (if enabled)
    - `modalOverlay` - Modal backdrop overlay
    - Other shared UI state
- **Access**: `editor.context.get('toolbar')`

**2. Frame Context (`editor.frameContext`)**

- **Type**: `FrameContextUtil` - convenience pointer to current frame
- **Points to**: `frameRoots.get(editor.status.rootKey)`
- **Purpose**: Per-frame state and DOM references
- **Contents**:
    - `wysiwyg` - Editable frame DOM element
    - `code` - Code view textarea (if enabled)
    - `options` - Per-frame FrameOptions Map
    - `isCodeView`, `isReadOnly`, `isDisabled`, `isFullScreen` - State flags
    - `topArea`, `placeholder`, `statusbar` - Frame-specific DOM references
- **Access**: `editor.frameContext.get('wysiwyg')`
- **Switching**: `editor.changeFrameContext(rootKey)` updates the pointer

**3. Frame Roots Storage (`editor.frameRoots`)**

- **Type**: `Map<rootKey, FrameContext>`
- **Purpose**: Actual data storage for all frames
- **Structure**:
    ```
    frameRoots
    ├── null → FrameContext (Map)          [Single-root]
    ├── 'frame1' → FrameContext1 (Map)     [Multi-root]
    ├── 'frame2' → FrameContext2 (Map)     [Multi-root]
    └── ...
    ```
- **Access**: `editor.frameRoots.get(rootKey).get('wysiwyg')`
- **rootKey**: `null` for single-root, custom string for multi-root
- **Direct usage**: Rare - use `frameContext` pointer instead

**4. Frame Options (`editor.frameOptions`)**

- **Type**: `FrameOptionsMap` - convenience pointer
- **Points to**: `frameContext.get('options')`
- **Purpose**: Quick access to current frame's options
- **Access**: `editor.frameOptions.get('height')`

**Key Concepts:**

- `context` and `options` are actual Map storage
- `frameContext` and `frameOptions` are pointers to current frame in `frameRoots`
- `frameRoots` is the actual storage - `frameContext` just points to current entry
- All contexts use Map with utility wrappers for type safety and convenience

### Type System

Types are defined in JSDoc format in source files and generated into TypeScript definitions:

- `src/**/*.js`: JSDoc-annotated source files
- `types/**/*.d.ts`: Generated TypeScript definitions (built via `npm run ts-build`)
- Type generation uses `barrelsby` for barrel exports and custom scripts for processing

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
npm run i18n-build      # Sync language files (requires Google API credentials)
```

---

## Naming Conventions

**File Naming:**

- **JavaScript files**: camelCase (e.g., `selection.js`, `eventManager.js`)
- **Class files**: Match class name (e.g., `Modal.js` for `Modal` class)
- **Plugin files**: Match plugin key (e.g., `image.js` for key `'image'`)

**Code Naming:**

- **Classes**: PascalCase (e.g., `EditorInjector`, `Modal`, `ImagePlugin`)
- **Functions/Methods**: camelCase (e.g., `getRange`, `setContent`, `applyTagEffect`)
- **Private fields/methods**:
    - ES2022: `#privateField`, `#privateMethod()`
    - Legacy: `_privateMethod()` (underscore prefix)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ACTION_TYPE`, `EVENT_TYPES`)

**Plugin Naming:**

- **Plugin keys**: lowercase string (e.g., `'image'`, `'video'`, `'formatBlock'`)
- **Plugin types**: lowercase string (e.g., `'command'`, `'modal'`, `'dropdown'`)
- **Plugin class names**: PascalCase with type suffix (e.g., `ImagePlugin`, `AlignDropdown`)

**CSS Naming:**

- **Prefix**: All classes start with `se-` (e.g., `se-wrapper`, `se-component`)
- **BEM-like**: `se-block__element--modifier` pattern
- **Component classes**: `se-component`, `se-flex-component`

**Variable Naming:**

- **DOM elements**: Descriptive names with element type (e.g., `toolbarElement`, `wysiwygFrame`)
- **Booleans**: Use `is`/`has`/`should` prefix (e.g., `isCodeView`, `hasSelection`)
- **Maps/Collections**: Plural or descriptive (e.g., `frameRoots`, `_onPluginEvents`)

---

## Common Pitfalls

**DON'T:**

- ❌ Use `innerHTML` directly on wysiwyg frame

    ```javascript
    // BAD
    this.frameContext.get('wysiwyg').innerHTML = content;

    // GOOD
    this.html.set(content);
    ```

- ❌ Access `frameRoots` directly unless necessary

    ```javascript
    // BAD
    const wysiwyg = this.frameRoots.get(this.status.rootKey).get('wysiwyg');

    // GOOD
    const wysiwyg = this.frameContext.get('wysiwyg');
    ```

- ❌ Register events without using EventManager

    ```javascript
    // BAD
    element.addEventListener('click', handler);

    // GOOD (auto-cleanup on destroy)
    this.eventManager.addEvent(element, 'click', handler);
    ```

- ❌ Create new plugin without extending EditorInjector

    ```javascript
    // BAD
    class MyPlugin {
    	constructor(editor) {
    		this.editor = editor;
    	}
    }

    // GOOD
    class MyPlugin extends EditorInjector {
    	constructor(editor) {
    		super(editor); // Injects all dependencies
    	}
    }
    ```

**DO:**

- ✅ Always use `this.selection` methods for selection management
- ✅ Use `this.html` methods for content manipulation
- ✅ Use `this.format` methods for block-level formatting
- ✅ Register all events via `eventManager` for automatic cleanup
- ✅ Use `frameContext` and `frameOptions` instead of direct `frameRoots` access
- ✅ Check element types with `dom.check` methods (iframe-safe)
- ✅ Use helper functions from `src/helper/` for common operations
- ✅ Follow the Redux pattern for event handling (Reducer → Actions → Effects)

**Common Mistakes:**

1. **Forgetting to call `super(editor)` in plugin constructor**
    - Results in missing injected properties

2. **Not restoring selection after DOM changes**
    - User loses cursor position

3. **Using `instanceof` checks in iframe context**
    - Use `dom.check.isElement()` instead

4. **Directly mutating `options` or `context` Maps**
    - Use getter/setter methods instead

---

## Plugin Registration Flow

Understanding how plugins are registered helps when debugging or creating custom plugins:

**1. User Configuration**

```javascript
const editor = suneditor.create(element, {
	plugins: [image, video, link, table] // Plugin classes
	// ... other options
});
```

**2. Constructor Creates DOM & Plugin Map** (`src/section/constructor.js`)

```javascript
// Constructor.js processes options.plugins array
// Stores plugin classes (NOT instances) in product.plugins object
const product = {
	plugins: {
		image: ImagePlugin, // Class reference
		video: VideoPlugin,
		link: LinkPlugin
		// ... etc
	}
	// ...
};
```

**3. Editor Constructor** (`src/core/editor.js`)

```javascript
function Editor(multiTargets, options) {
	// ... property initialization
	this.plugins = product.plugins || {}; // Plugins are still classes, not instances

	// Create editor
	this.__Create(options);
}
```

**4. Editor Initialization Flow** (`editor.__Create() → __registerClass() → __editorInit() → __init()`)

```javascript
__init(options) {
	// Loop through all plugin keys
	for (const key in plugins) {
		// Register each plugin (this instantiates them)
		this.registerPlugin(key, this._pluginCallButtons[key], options[key]);
		this.registerPlugin(key, this._pluginCallButtons_sub[key], options[key]);
		plugin = this.plugins[key]; // Now it's an instance

		// Register plugin events (onInput, onFilePasteAndDrop, etc.)
		this._onPluginEvents.forEach((v, k) => {
			if (typeof plugin[k] === 'function') {
				const f = plugin[k].bind(plugin);
				v.push(f);
			}
		});

		// Register retainFormat method
		if (plugin.retainFormat) {
			const info = plugin.retainFormat();
			this._MELInfo.set(info.query, { key, method: info.method });
		}
	}
}
```

**5. Plugin Instantiation** (`editor.registerPlugin()`)

```javascript
registerPlugin(pluginName, targets, pluginOptions) {
	let plugin = this.plugins[pluginName];

	// If plugin is a class (function), instantiate it
	if (typeof this.plugins[pluginName] === 'function') {
		// 1. Create instance
		plugin = this.plugins[pluginName] = new this.plugins[pluginName](this, pluginOptions || {});

		// 2. Plugin constructor calls super(editor)
		//    → EditorInjector injects all dependencies

		// 3. Call init() if exists
		if (typeof plugin.init === 'function') plugin.init();
	}

	// 4. Update toolbar buttons if provided
	if (targets) {
		for (let i = 0; i < targets.length; i++) {
			UpdateButton(targets[i], plugin, this.icons, this.lang);
		}

		// 5. Add to activeCommands if has active() method
		if (!this.activeCommands.includes(pluginName) && typeof plugin.active === 'function') {
			this.activeCommands.push(pluginName);
		}
	}
}
```

**6. Plugin Activation (Runtime)**

When user clicks toolbar button or triggers action:

```javascript
// Modal plugin
button.click → editor.run(command, 'modal', button) → plugin.open(button) → Modal shows → plugin.on()

// Command plugin
button.click → editor.run(command, 'command', button) → plugin.action(button)

// Dropdown plugin
button.click → editor.run(command, 'dropdown', button) → menu.dropdownOn(button) → plugin.on(target)

// Browser plugin
button.click → editor.run(command, 'browser', button) → plugin.open(null)
```

**7. Plugin Method Calls by Component**

Different components call plugin methods at different lifecycle stages:

- **Editor**: `registerPlugin()` → instantiation, `init()`, `run()` → `action()`, `shortcut()`
- **EventManager**: `active()`, `onInput()`, `onFilePasteAndDrop()`, `onKeyDown()`, etc.
- **Modal Module**: `open()`, `close()`, `init()`, `on()`, `off()`, `modalAction()`
- **Controller Module**: `select()`, `deselect()`, `edit()`, `destroy()`, `controllerAction()`
- **Component Class**: `retainFormat()`, `show()`

**Key Points:**

- Plugins start as **class references** in `product.plugins`
- They are **instantiated** in `registerPlugin()` during `__init()`
- `registerPlugin()` can be called **multiple times** safely (checks if already instantiated)
- Plugins stored in `this.plugins` object (not Map) with key as property name
- Constructor must call `super(editor)` to receive dependency injection

---

## Example Implementations

**Reference these files when creating similar functionality:**

**Simple Command Plugin:**

- `src/plugins/command/blockquote.js` - Minimal command plugin
- `src/plugins/command/list.js` - List formatting command

**Modal Plugin with Form:**

- `src/plugins/modal/link.js` - Link dialog with form validation
- `src/plugins/modal/image.js` - Image upload with Figure module

**Dropdown Plugin:**

- `src/plugins/dropdown/align.js` - Simple dropdown menu
- `src/plugins/dropdown/formatBlock.js` - Dropdown with SelectMenu module

**Component Plugin:**

- `src/plugins/modal/image.js` - Full component lifecycle (create, select, edit, delete)
- `src/plugins/modal/video.js` - Component with multiple content types

**Field Plugin (Autocomplete):**

- `src/plugins/field/mention.js` - Inline autocomplete with `onInput()`

**Core Class:**

- `src/core/class/selection.js` - Selection and range manipulation
- `src/core/class/format.js` - Block-level formatting operations

**Module:**

- `src/modules/Modal.js` - Dialog window system
- `src/modules/Controller.js` - Floating toolbar controller

**Event Handling:**

- `src/core/event/handlers/handler_ww_key.js` - Wysiwyg keyboard event handlers
- `src/core/event/reducers/keydown.reducer.js` - Analyzes keydown events and returns action lists
- `src/core/event/rules/keydown.rule.enter.js` - Enter key specific rules
- `src/core/event/effects/keydown.registry.js` - Keydown effect handlers registry
- `src/core/event/actions/index.js` - Action type definitions

**Example Event Flow (Enter Key):**

```
1. User presses Enter
   ↓
2. handler_ww_key.js captures keydown event
   ↓
3. keydown.reducer.js analyzes the event with current editor state
   ↓
4. keydown.rule.enter.js determines specific behavior (insert line, exit block, etc.)
   ↓
5. Returns action list: [{t: 'enter.line.addDefault', p: {...}}, {t: 'history.push', p: {...}}]
   ↓
6. executor.js processes actions and calls corresponding effects
   ↓
7. Effects from keydown.registry.js execute:
   - 'enter.line.addDefault' effect → calls format.addLine()
   - 'history.push' effect → calls history.push()
   ↓
8. DOM updated, selection adjusted, onChange event triggered
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
- Test interactions between multiple classes/plugins

### E2E Tests (`test/e2e/`)

- Playwright tests running against local dev server
- Test full user workflows and browser interactions
- Run on Chromium by default

## Common Development Patterns

### Adding a New Plugin

1. Create plugin file in appropriate `src/plugins/` subdirectory
2. Export plugin object with required methods (`html`, `action`/`open`, etc.)
3. Add import and export to `src/plugins/index.js`
4. Plugin will be auto-registered when included in `plugins` option array

### Working with Frame Context

```javascript
// Get current frame's context
const wysiwyg = this.frameContext.get('wysiwyg');
const isCodeView = this.frameContext.get('isCodeView');

// Apply to all frames
this.applyFrameRoots((frameContext) => {
	const wysiwyg = frameContext.get('wysiwyg');
	// ... operate on each frame
});
```

### Event Handling

SunEditor uses a Redux-like event architecture managed by **EventManager** (`src/core/event/eventManager.js`).

**Event Flow:**

```
DOM Event → Handler → Reducer → Actions → Executor → Effects → Core Classes → DOM Update
```

**EventManager Responsibilities:**

- **Event Registration**: `addEvent()`, `removeEvent()`, `addGlobalEvent()`, `removeGlobalEvent()`
    - All DOM events registered via EventManager are automatically cleaned up on `destroy()` or `setOptions()`
- **Tag Effect Application**: `applyTagEffect()` - Updates toolbar button states based on cursor position
- **Plugin Event Delegation**: `_callPluginEvent()` - Triggers internal plugin events
- **Component Selection**: Detects and selects components (images, videos) on hover/click

**Event Types:**

1. **User Events** (via `triggerEvent()`): Custom callbacks defined in `options.events`
    - Example: `onChange`, `onPaste`, `onImageUpload`, etc.

2. **Plugin Events** (via `_onPluginEvents` Map): Internal plugin communication
    - Example: `onPaste`, `onFocus`, `onBlur`, `onFilePasteAndDrop`
    - Registered by plugins during initialization

3. **DOM Events** (via `eventManager.addEvent()`): Low-level browser events
    - Registered in `_addCommonEvents()` and `_addFrameEvents()`
    - Automatically cleaned up when editor is destroyed

**Usage in Plugins/Modules:**

```javascript
// Register DOM event (auto-cleanup)
this.eventManager.addEvent(element, 'click', handler, false);

// Trigger user event
this.triggerEvent('onChange', { frameContext, event, data });

// Call plugin event
this._callPluginEvent('onPaste', { frameContext, event, data });
```

### Selection Management

Always restore selection after DOM manipulations:

```javascript
const range = this.selection.getRange();
// ... modify DOM ...
this.selection.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
```

## Build System

- **Webpack** for bundling (config in `webpack/`)
- **Babel** for transpilation to ES2022 baseline
- **ESLint** with Prettier for code quality
- **Output**: `dist/suneditor.min.js` and `dist/suneditor.min.css`

The `dist/` folder is NOT tracked in git and is built via CI/CD when changes are pushed to the `release` branch.
