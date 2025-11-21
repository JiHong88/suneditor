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
│   │   ├── dropdown/        # Dropdown menus (align, font, blockStyle, table)
│   │   ├── modal/           # Dialog plugins (image, video, link, math)
│   │   ├── browser/         # Gallery plugins (imageGallery, videoGallery)
│   │   ├── field/           # Autocomplete (mention)
│   │   ├── input/           # Toolbar inputs (fontSize, pageNavigator)
│   │   └── popup/           # Inline controllers (anchor)
│   ├── modules/             # UI components
│   │   ├── contracts/       # Module contracts (required hooks)
│   │   │   ├── Modal.js     # Modal contract (modalAction, modalOn, modalOff, etc.)
│   │   │   ├── Controller.js # Controller contract (controllerAction, controllerClose, etc.)
│   │   │   ├── Figure.js    # Figure wrapper (component resize/align)
│   │   │   ├── Browser.js   # Browser contract (browserInit)
│   │   │   ├── ColorPicker.js # ColorPicker contract (colorPickerAction, etc.)
│   │   │   └── HueSlider.js # HueSlider contract (hueSliderAction, etc.)
│   │   └── utils/           # Module utilities (no required hooks)
│   │       ├── ModalAnchorEditor.js # Link form helper
│   │       ├── SelectMenu.js # Custom dropdown menu
│   │       ├── FileManager.js # File upload handler
│   │       ├── ApiManager.js # XHR request helper
│   │       └── _DragHandle.js # Drag state manager
│   ├── hooks/               # Hook interface definitions
│   │   ├── core.js          # Editor core hooks (Event, Component, Toolbar, Core)
│   │   ├── module.js        # Module contract hooks (Modal, Browser, ColorPicker, etc.)
│   │   └── params.js        # Hook parameter type definitions
│   ├── interfaces/          # Plugin base classes
│   │   ├── plugin.js        # Plugin type classes (PluginCommand, PluginModal, etc.)
│   │   └── index.js         # Interface exports
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
- **Legacy syntax**: The `src/core/` directory still uses constructor functions with prototype patterns
- Originally kept for IE compatibility, but IE support has been dropped.
    - All other directories have migrated to ES6+ class syntax, but the core remains as-is due to:
    - A large, deeply interconnected codebase with high refactoring risk
        - Stable and well-tested logic that gains little practical benefit from migration
        - Development resources being more effectively spent on new features and improvements
        - This is a decision based on the current cost–benefit trade-offs of a full migration

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
   │     ┌────────────────────────────────────┐
   │     │ Modules                            │
   │     ├────────────────────────────────────┤
   │     │ contracts/                         │
   │     │  • Modal      ← modal plugins      │
   │     │  • Controller ← component plugins  │
   │     │  • Figure     ← image/video/audio  │
   │     │  • Browser    ← gallery plugins    │
   │     │  • ColorPicker ← color plugins     │
   │     │  • HueSlider  ← color plugins      │
   │     │                                    │
   │     │ utils/                             │
   │     │  • SelectMenu     ← dropdowns      │
   │     │  • ModalAnchorEditor ← link plugin │
   │     │  • FileManager    ← file uploads   │
   │     │  • ApiManager     ← external APIs  │
   │     └────────────────────────────────────┘
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
        - Tags: `BLOCKQUOTE`, `OL`, `UL`, `FIGCAPTION`, `TABLE`, `THEAD`, `TBODY`, `TR`, `CAPTION`, `DETAILS`
        - Can be exited: Pressing Enter/Backspace at edges exits the block
        - Example: `<blockquote><p>Quote</p></blockquote>` → Enter at end creates `<p>` outside
    - **Closure Block** (`format.isClosureBlock()`): Constrained blocks that trap cursor
        - Tags: `TH`, `TD` (table cells)
        - Cannot be exited: Enter/Backspace always stays within the block
        - Example: Table cells where Enter creates new line/BR inside cell, never exits

**Special Case: Lists (OL/UL/LI)**

Lists are a special Block-Line combination where:

- **List Container** (`OL`, `UL`): Block-level elements
- **List Item** (`LI`): Line-level elements that can ONLY exist inside list containers
- **Special Handling**: Many operations (Enter, Tab, Backspace) require different logic than regular Block-Line structures
- **Dedicated Class**: `listFormat.js` handles list-specific operations (nesting, indentation, merging)
- **Common Checks**: `dom.check.isList()`, `dom.check.isListCell()`

Example pattern in code:

```javascript
if (dom.check.isList(block) || dom.check.isListCell(line)) {
    // Special list handling via listFormat
    this.listFormat.apply(...);
}
```

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
- **Examples**: Images, videos, audio, tables, drawings

#### **3.1. Inline Component** (Special Case)

- **Definition**: Components that exist **inside** lines (exception to the component-line sibling rule)
- **Purpose**: Small interactive elements that flow with text (math formulas, inline images/anchors)
- **Validation**: `component.isInline(element)` - checks for `se-inline-component` class
- **Container**: Uses `<span class="se-component se-inline-component">` wrapper (not `<div>`)
- **Examples**: Math formulas, inline anchors
- **Key Difference**: These are the **only** components that can exist inside a line

**Key Design Rules:**

1. **Mandatory State**: Every position must be in exactly one of: `line`, `block`, `component`, or `inline-component`
2. **Hierarchy**: `block` → contains → `line` (structural containment)
3. **Siblings**: **Block components** and `line` exist at the same hierarchy level (never parent-child)
4. **Inline Exception**: **Inline components** can exist inside a `line` (only exception to sibling rule)
5. **Block Wrapping**: Blocks provide structure by wrapping multiple lines

**Example Structure:**

```html
<div class="se-wrapper-wysiwyg">
	<p>
		Line 1: text with <span class="se-component se-inline-component"><katex>E=mc^2</katex></span> formula
	</p>
	<!-- line with inline component inside -->
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
	<ul>
		<!-- block -->
		<li>Line 3: list item</li>
		<!--   └─ line (inside block) -->
		<li>Line 4: list item</li>
		<!--   └─ line (inside block) -->
	</ul>
</div>
```

#### Content Filtering: strictMode

The `strictMode` option controls how strictly SunEditor validates and cleans HTML content. It ensures content conforms to the editor's structural rules and security policies.

**Configuration:**

```javascript
SUNEDITOR.create('editor', {
	// Boolean mode (all filters on/off)
	strictMode: true, // default - all filters enabled
	strictMode: false, // disable all filters

	// Granular control
	strictMode: {
		tagFilter: true, // Filter disallowed HTML tags
		formatFilter: true, // Enforce line/block/component structure
		classFilter: true, // Validate CSS classes
		textStyleTagFilter: true, // Convert inline style tags to styled text
		attrFilter: true, // Filter HTML attributes
		styleFilter: true, // Filter inline styles
	},
});
```

**Filter Types:**

| Filter                   | Purpose                                                       | When Disabled                                         |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------- |
| **`tagFilter`**          | Removes disallowed HTML tags based on whitelist/blacklist     | Allows any HTML tags (security risk)                  |
| **`formatFilter`**       | Enforces line/block/component structure rules                 | Components may not wrap properly in figure containers |
| **`classFilter`**        | Validates CSS classes against allowedClassName                | Allows any CSS classes                                |
| **`textStyleTagFilter`** | Converts `<B>`, `<I>`, `<U>` to styled `<SPAN>` elements      | Keeps original inline style tags                      |
| **`attrFilter`**         | Filters attributes based on allowedAttributes/pasteTagsFilter | Allows any attributes (XSS risk)                      |
| **`styleFilter`**        | Filters inline styles based on pasteTagsFilter                | Allows any inline styles                              |

**How Filters Work:**

```javascript
// tagFilter: Removes disallowed tags
// Input:  <script>alert('xss')</script><p>text</p>
// Output: <p>text</p>

// formatFilter: Wraps components in proper containers
// Input:  <img src="...">
// Output: <div class="se-component"><figure><img src="..."></figure></div>

// classFilter: Validates against allowedClassName
// Input:  <div class="custom-class invalid-class">text</div>
// Output: <div class="custom-class">text</div> (if 'custom-class' in allowedClassName)

// textStyleTagFilter: Converts style tags to styled spans
// Input:  <b>bold</b> <i>italic</i> <u>underline</u>
// Output: <span style="font-weight: bold;">bold</span> <span style="font-style: italic;">italic</span> <span style="text-decoration: underline;">underline</span>

// attrFilter + styleFilter: Cleans attributes and styles
// Input:  <p onclick="hack()" style="color: red; position: fixed;">text</p>
// Output: <p style="color: red;">text</p> (removes onclick, filters dangerous styles)
```

**When to Disable Filters:**

- **`formatFilter: false`**: Allow components without figure wrappers (legacy content compatibility)
- **`textStyleTagFilter: false`**: Preserve original `<b>`, `<i>`, `<u>` tags (some frameworks require specific tags)
- **Other filters**: Generally should stay enabled for security

**Security Note:** Disabling `tagFilter`, `attrFilter`, or `styleFilter` can expose your application to XSS attacks. Only disable if you fully trust the content source and have server-side sanitization.

**Related Options:**

- `elementWhitelist` - Additional allowed HTML tags
- `elementBlacklist` - Explicitly blocked HTML tags
- `allowedClassName` - Allowed CSS class names
- `pasteTagsFilter` - Per-tag attribute/style filtering rules

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

**Architecture Pattern**: ES6 classes extending plugin type base classes from `src/interfaces/plugin.js`

- Constructor: `constructor(editor, pluginOptions)` → calls `super(editor)`
- Static properties: `static key`, `static type`, `static className` (type is auto-set by base class)
- Full editor access via inherited properties: `this.editor`, `this.selection`, `this.html`, `this.format`, etc.
- Lifecycle controlled by editor and modules (Modal, Controller, etc.)
- Each plugin type has specific required methods defined by its base class

**Plugin Type Base Classes:**

| Base Class               | Type            | Folder      | Required Methods           | Examples                    |
| ------------------------ | --------------- | ----------- | -------------------------- | --------------------------- |
| **`PluginCommand`**      | `command`       | `command/`  | `action()`, `active()`     | blockquote, list, exportPDF |
| **`PluginDropdown`**     | `dropdown`      | `dropdown/` | `action()`                 | align, font, blockStyle     |
| **`PluginDropdownFree`** | `dropdown-free` | `dropdown/` | (none - handle own events) | table                       |
| **`PluginModal`**        | `modal`         | `modal/`    | `open()`                   | image, video, link, math    |
| **`PluginBrowser`**      | `browser`       | `browser/`  | `open()`, `close()`        | imageGallery, videoGallery  |
| **`PluginField`**        | `field`         | `field/`    | (none - uses hooks)        | mention                     |
| **`PluginInput`**        | `input`         | `input/`    | (none - uses hooks)        | fontSize, pageNavigator     |
| **`PluginPopup`**        | `popup`         | `popup/`    | `show()`                   | anchor                      |

**Example Usage:**

```javascript
import { PluginModal } from '../../interfaces';

class MyPlugin extends PluginModal {
	static key = 'myPlugin';
	// type is automatically 'modal' from PluginModal
	static className = 'se-btn-my-plugin';

	constructor(editor, options) {
		super(editor);
		// Full editor access via inherited properties
	}

	open(target) {
		// Required by PluginModal
	}
}
```

**Key Differences:**

- **Plugins**: Extend type-specific base classes from `src/interfaces/plugin.js` (full editor access)
- **Core Classes**: Extend `EditorInjector` (full editor access)
- **Modules**: Extend `CoreInjector` (minimal coupling)

#### Plugin Methods Reference

Plugin methods are organized into three categories:

1. **Interface Methods** - Type-specific methods defined by plugin base classes
2. **Common Hooks** - Lifecycle and event hooks available to ALL plugins
3. **Module Hooks** - Hooks for plugins using specific modules (Modal, Controller, etc.)

> **Legend:**
>
> - ✅ Required | 📝 Optional
> - ⭐⭐⭐ Very common | ⭐⭐ Moderate | ⭐ Rare

---

##### 1. Interface Methods (Type-Specific)

**PluginCommand** - Examples: blockquote, list_bulleted, exportPDF

| Method           | Required | When Called              | Return            |
| ---------------- | -------- | ------------------------ | ----------------- |
| `action(target)` | ✅       | Button click or API call | `void \| Promise` |

**PluginDropdown** - Examples: align, font, blockStyle

| Method           | Required | When Called           | Return            |
| ---------------- | -------- | --------------------- | ----------------- |
| `action(target)` | ✅       | Dropdown item clicked | `void \| Promise` |
| `on(target)`     | 📝       | After dropdown opens  | `void`            |

**PluginDropdownFree** - Examples: table

| Method       | Required | When Called           | Return |
| ------------ | -------- | --------------------- | ------ |
| `on(target)` | 📝       | After dropdown opens  | `void` |
| `off()`      | 📝       | After dropdown closes | `void` |

**PluginModal** - Examples: image, video, link, math

| Method         | Required | When Called        | Return |
| -------------- | -------- | ------------------ | ------ |
| `open(target)` | ✅       | Modal open request | `void` |

**PluginBrowser** - Examples: imageGallery, videoGallery, fileGallery

| Method                   | Required | When Called          | Return |
| ------------------------ | -------- | -------------------- | ------ |
| `open(onSelectFunction)` | ✅       | Browser open request | `void` |
| `close()`                | ✅       | Browser close        | `void` |

**PluginField** - Examples: mention

No required interface methods (uses hooks exclusively).

**PluginInput** - Examples: fontSize, pageNavigator

| Method                        | Required | When Called              | Return |
| ----------------------------- | -------- | ------------------------ | ------ |
| `toolbarInputKeyDown(params)` | 📝       | Keydown in toolbar input | `void` |
| `toolbarInputChange(params)`  | 📝       | Toolbar input change     | `void` |

**PluginPopup** - Examples: anchor

| Method   | Required | When Called | Return |
| -------- | -------- | ----------- | ------ |
| `show()` | ✅       | Popup shown | `void` |

---

##### 2. Common Hooks (All Plugins)

These hooks from `src/hooks/core.js` can be implemented by **any plugin type**.

| Hook                      | When Called                          | Return                 | Common Usage             |
| ------------------------- | ------------------------------------ | ---------------------- | ------------------------ |
| `active(element, target)` | Selection change                     | `boolean \| undefined` | ⭐⭐⭐ command, dropdown |
| `init()`                  | Editor initialization / resetOptions | `void`                 | ⭐ align (rare)          |
| `retainFormat()`          | HTML cleaning/validation             | `{query, method}`      | ⭐⭐ modal, dropdown     |
| `shortcut(params)`        | Shortcut key triggered               | `void`                 | ⭐ command               |
| `setDir(dir)`             | RTL direction change                 | `void`                 | ⭐ dropdown              |

###### Component Lifecycle Hooks

| Hook                        | When Called                 | Return            | Common Usage    |
| --------------------------- | --------------------------- | ----------------- | --------------- |
| `componentSelect(target)`   | Component selected          | `void \| boolean` | ⭐⭐⭐ modal    |
| `componentDeselect(target)` | Component deselected        | `void`            | ⭐ modal, popup |
| `componentEdit(target)`     | Component edit button click | `void`            | ⭐⭐⭐ modal    |
| `componentDestroy(target)`  | Component delete            | `Promise<void>`   | ⭐⭐ modal      |
| `componentCopy(params)`     | Copy event                  | `boolean \| void` | ⭐ modal        |

###### Event Hooks

> ✨ = Has async variant using same method name
>
> - Sync: `@type {SunEditor.Hook.Event.OnInput} onInput`
> - Async: `@type {SunEditor.Hook.Event.OnInputAsync} async onInput`
>
> 🔸 = Interruptible event (returning boolean stops event loop and prevents default behavior)

| Hook                    | When Called          | Return            | Common Usage  |
| ----------------------- | -------------------- | ----------------- | ------------- |
| `onKeyDown` ✨ 🔸       | Key down in editor   | `boolean \| void` | ⭐ table      |
| `onKeyUp` ✨ 🔸         | Key up in editor     | `boolean \| void` | ⭐ table      |
| `onMouseDown` ✨ 🔸     | Mouse down in editor | `boolean \| void` | ⭐ table      |
| `onClick` ✨ 🔸         | Click in editor      | `boolean \| void` | ⭐ -          |
| `onPaste` ✨ 🔸         | Paste event          | `boolean \| void` | ⭐⭐ table    |
| `onBeforeInput` ✨      | Before input event   | `boolean \| void` | ⭐ -          |
| `onInput` ✨            | Editor content input | `boolean \| void` | ⭐⭐⭐ field/ |
| `onMouseUp` ✨          | Mouse up in editor   | `boolean \| void` | ⭐ table      |
| `onMouseLeave` ✨       | Mouse leave editor   | `boolean \| void` | ⭐ table      |
| `onMouseMove`           | Mouse move in editor | `void`            | ⭐ table      |
| `onScroll`              | Editor scroll        | `void`            | ⭐ table      |
| `onFocus`               | Editor focus         | `void`            | ⭐ -          |
| `onBlur`                | Editor blur          | `void`            | ⭐ -          |
| `onFilePasteAndDrop` ✨ | File paste/drop      | `boolean \| void` | ⭐⭐ modal/   |

**Event Hook Return Values:**

- `false` - Stops remaining plugins + prevents default editor behavior
- `true` - Stops remaining plugins + allows default editor behavior
- `void`/`undefined` - Continues to next plugin

---

##### 3. Module Hooks (When Using Modules)

These hooks from `src/hooks/module.js` are implemented by plugins using specific modules.

###### Modal Module (used by modal plugins)

| Hook                 | Required | When Called             | Return             | Usage  |
| -------------------- | -------- | ----------------------- | ------------------ | ------ |
| `modalAction()`      | ✅       | Form submit             | `Promise<boolean>` | ⭐⭐⭐ |
| `modalOn(isUpdate)`  | 📝       | After modal opens       | `void`             | ⭐⭐⭐ |
| `modalOff(isUpdate)` | 📝       | After modal closes      | `void`             | ⭐⭐⭐ |
| `modalInit()`        | 📝       | Before modal open/close | `void`             | ⭐     |
| `modalResize()`      | 📝       | Modal window resized    | `void`             | ⭐     |

###### Controller Module (used by component plugins)

| Hook                       | Required | When Called              | Return | Usage |
| -------------------------- | -------- | ------------------------ | ------ | ----- |
| `controllerAction(target)` | 📝       | Controller button click  | `void` | ⭐⭐  |
| `controllerClose()`        | 📝       | Before controller closes | `void` | ⭐    |

###### ColorPicker Module (used by color plugins)

| Hook                          | Required | When Called               | Return | Usage  |
| ----------------------------- | -------- | ------------------------- | ------ | ------ |
| `colorPickerAction(color)`    | ✅       | Color selected            | `void` | ⭐⭐⭐ |
| `colorPickerHueSliderOpen()`  | 📝       | Before hue slider opens   | `void` | ⭐     |
| `colorPickerHueSliderClose()` | 📝       | When hue slider cancelled | `void` | ⭐     |

###### HueSlider Module (used by ColorPicker)

| Hook                      | Required | When Called              | Return | Usage |
| ------------------------- | -------- | ------------------------ | ------ | ----- |
| `hueSliderAction(color)`  | ✅       | Color selected in slider | `void` | ⭐⭐  |
| `hueSliderCancelAction()` | 📝       | Hue slider cancelled     | `void` | ⭐    |

###### Browser Module (used by browser plugins)

| Hook            | Required | When Called          | Return | Usage |
| --------------- | -------- | -------------------- | ------ | ----- |
| `browserInit()` | 📝       | Before browser opens | `void` | ⭐    |

---

#### Hook Parameter Types

Many hook methods receive standardized parameter objects defined in [`src/hooks/params.js`](src/hooks/params.js). These types are exposed as `SunEditor.HookParams.*` in the public API.

**Common Parameter Types:**

| Type                                 | Properties                                      | Used By                                                              |
| ------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------- |
| **`HookParams.MouseEvent`**          | `{ frameContext, event }`                       | `onMouseDown`, `onMouseUp`, `onClick`, `onMouseMove`, `onMouseLeave` |
| **`HookParams.KeyEvent`**            | `{ frameContext, event, range, line }`          | `onKeyDown`, `onKeyUp`                                               |
| **`HookParams.Frame`**               | `{ frameContext, event }`                       | `onFocus`, `onBlur`, `onScroll`, `onBeforeInput`, `onInput`          |
| **`HookParams.Paste`**               | `{ frameContext, event, data, doc }`            | `onPaste`, `onPasteAsync`                                            |
| **`HookParams.FilePasteDrop`**       | `{ frameContext, event, file }`                 | `onFilePasteAndDrop`, `onFilePasteAndDropAsync`                      |
| **`HookParams.ToolbarInputKeydown`** | `{ target, event, value }`                      | `toolbarInputKeyDown`                                                |
| **`HookParams.ToolbarInputChange`**  | `{ target, event, value }`                      | `toolbarInputChange`                                                 |
| **`HookParams.Shortcut`**            | `{ range, line, info, event, keyCode, editor }` | `shortcut`                                                           |
| **`HookParams.CopyComponent`**       | `{ event, cloneContainer, info }`               | `componentCopy`                                                      |

**Property Descriptions:**

- **`frameContext`** (`SunEditor.FrameContext`) - Current editing frame context (contains wysiwyg, options, state)
- **`event`** (DOM Event) - Original browser event (MouseEvent, KeyboardEvent, ClipboardEvent, etc.)
- **`range`** (`Range`) - Current selection range
- **`line`** (`HTMLElement`) - Current format line element
- **`data`** (`string`) - Clipboard data or input data
- **`doc`** (`Document`) - Document fragment from clipboard
- **`file`** (`File`) - Pasted or dropped file object
- **`target`** (`HTMLElement`) - Event target element
- **`value`** (`string`) - Input value
- **`info`** (varies) - Context-specific information object

**Usage Example:**

```javascript
import { PluginField } from '../../interfaces';

class MyFieldPlugin extends PluginField {
	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnKeyDown}
	 */
	onKeyDown(params) {
		const { frameContext, event, range, line } = params;

		// Access frame state
		if (frameContext.get('isReadOnly')) return;

		// Handle keyboard events
		if (event.key === 'Enter') {
			event.preventDefault();
			// Custom enter key handling
		}

		// Work with selection
		console.log('Current line:', line.tagName);
		console.log('Cursor position:', range.startOffset);
	}

	/**
	 * @hook Editor.EventManager
	 * @type {SunEditor.Hook.Event.OnPasteAsync}
	 */
	async onPaste(params) {
		const { frameContext, event, data, doc } = params;

		// Process pasted content
		if (data.includes('forbidden')) {
			event.preventDefault();
			return false; // Cancel paste
		}

		// Async processing of clipboard document
		await this.processClipboard(doc);
	}
}
```

**Type Definitions:**

All hook parameter types are fully documented with JSDoc in [`src/hooks/params.js`](src/hooks/params.js) and exposed through [`src/typedef.js`](src/typedef.js) for IDE autocomplete and type checking.

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
| **`SelectMenu`**        | Custom dropdowns     | Instance + items          | font, blockStyle           |
| **`ColorPicker`**       | Color palette        | Instance + callbacks      | fontColor, backgroundColor |
| **`HueSlider`**         | HSL color wheel      | Instance + attach         | ColorPicker                |
| **`FileManager`**       | File uploads         | Instance + async          | image, video, audio        |
| **`ApiManager`**        | XHR requests         | Static only               | Browser, mention           |
| **`ModalAnchorEditor`** | Link form            | Instance + form           | link, image                |
| **`Browser`**           | Gallery UI           | Instance + API            | imageGallery, videoGallery |
| **`_DragHandle`**       | Drag state           | Map (not class)           | component.js               |

#### Module Contracts (`src/modules/contracts/`)

Module contracts are interfaces that define plugin hooks called by specific modules. Plugins using these modules **must implement required hooks** and may optionally implement optional hooks.

> **For plugin development perspective**, see [Module-specific callback methods](#hook-methods-optional-callbacks) in the Plugin Lifecycle section.

**Contract Types:**

| Contract File        | Module                | Required Hooks                           | Optional Hooks                                              |
| -------------------- | --------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| **`Modal.js`**       | `Modules.Modal`       | `modalAction()` (async, returns boolean) | `modalOn()`, `modalOff()`, `modalInit()`, `modalResize()`   |
| **`Controller.js`**  | `Modules.Controller`  | `controllerAction()`                     | `controllerClose()`                                         |
| **`ColorPicker.js`** | `Modules.ColorPicker` | `colorPickerAction(hex, rgb)`            | `colorPickerHueSliderOpen()`, `colorPickerHueSliderClose()` |
| **`HueSlider.js`**   | `Modules.HueSlider`   | `hueSliderAction(color)`                 | `hueSliderCancelAction()`                                   |
| **`Browser.js`**     | `Modules.Browser`     | _(none)_                                 | `browserInit()`                                             |
| **`Figure.js`**      | `Modules.Figure`      | _(see Component hooks)_                  | `figureCustomResize()`, `figureBeforeSizeUpdate()`          |

**Hook Naming Convention**: `{moduleName}{MethodName}` (e.g., `modalAction`, `controllerClose`)

**Implementation Example:**

```javascript
import { PluginModal } from '../../interfaces';

class MyModalPlugin extends PluginModal {
	// Required by Modal contract
	async modalAction() {
		// Handle form submission
		// Return false to prevent modal close
		return true;
	}

	// Optional Modal hooks
	modalOn() {
		// Called after modal opens
	}

	modalOff() {
		// Called after modal closes
	}
}
```

**Key Notes:**

- **Required hooks** will cause errors if not implemented (modules call them directly)
- **Optional hooks** are called with optional chaining (`?.()`) - safe to omit
- **Async hooks** (like `modalAction`) must return `Promise<boolean>`
- Module contracts are defined in `src/modules/contracts/` for type inference and documentation

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

EditorInjector provides dependency injection for plugins, giving full access to editor APIs and core classes. **All plugin base classes** (PluginCommand, PluginModal, etc.) extend EditorInjector, so you get these properties automatically.

**Usage (Plugin Development):**

```javascript
// Recommended: Extend plugin type-specific base classes
import { PluginCommand } from '../../interfaces';

class MyCustomPlugin extends PluginCommand {
	static key = 'myPlugin';
	static className = 'se-btn-my-plugin';

	constructor(editor, pluginOptions) {
		super(editor); // EditorInjector is inherited through PluginCommand

		// Now you have access to all injected properties:
		// - this.editor (main editor instance)
		// - this.selection, this.html, this.format (core classes)
		// - this.options, this.context, this.frameContext
		// - this.eventManager, this.history
		// - this.lang, this.icons, this._w, this._d
	}

	action() {
		// Use injected properties
		const range = this.selection.get();
		this.html.insert('<strong>Bold</strong>');
		this.history.push(false);
	}
}
```

**What EditorInjector Provides (Inherited by All Plugins):**

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

**Global Type Namespace:**

All internal types are exposed through the `SunEditor` global namespace to minimize global scope pollution:

```typescript
// In JSDoc (src files)
/** @param {SunEditor.Core} editor */
/** @type {SunEditor.Context} */

// In TypeScript (user projects)
import SunEditor from 'suneditor';
const editor: SunEditor.Core = SunEditor.create(...);
```

**Available Types in `SunEditor` namespace:**

- `SunEditor.Core` - Main editor instance
- `SunEditor.InitOptions` - Editor initialization options
- `SunEditor.Context` - Editor context map
- `SunEditor.FrameContext` - Frame context utilities
- `SunEditor.ComponentInfo` - Component metadata
- ... and 20+ more types (see `src/typedef.js`)

**Public API Types:**

The package also exports user-facing types directly (without `SunEditor.` prefix):

- `SunEditorOptions`, `SunEditorCore`, `SunEditorInstance`
- `SunEditorComponentInfo`, `SunEditorPluginKeyEvent`, etc.

These are defined in `src/suneditor.js` and re-exported from `types/index.d.ts`.

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
- **Plugin files**: Match plugin key (e.g., `image.js` for key `'image'`)

**Code Naming:**

- **Classes**: PascalCase (e.g., `EditorInjector`, `Modal`, `ImagePlugin`)
- **Functions/Methods**: camelCase (e.g., `getRange`, `setContent`, `applyTagEffect`)
- **Private fields/methods**:
    - ES2022: `#privateField`, `#privateMethod()`
    - Legacy: `_privateMethod()` (underscore prefix)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ACTION_TYPE`, `EVENT_TYPES`)

**Plugin Naming:**

- **Plugin keys**: lowercase string (e.g., `'image'`, `'video'`, `'blockStyle'`)
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

- ❌ Create new plugin without extending plugin base classes

    ```javascript
    // BAD
    class MyPlugin {
    	constructor(editor) {
    		this.editor = editor;
    	}
    }

    // GOOD - Extend plugin type base class
    import { PluginCommand } from '../../interfaces';

    class MyPlugin extends PluginCommand {
    	static key = 'myPlugin';
    	static className = 'se-btn-my-plugin';

    	constructor(editor) {
    		super(editor); // Injects all dependencies via EditorInjector
    	}

    	action() {
    		// Required by PluginCommand
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

3. **Directly mutating `options` or `context` Maps**
    - Use getter/setter methods instead

---

## Plugin Registration Flow

Understanding how plugins are registered helps when debugging or creating custom plugins:

**1. User Configuration**

```javascript
const editor = suneditor.create(element, {
	plugins: [image, video, link, table], // Plugin classes
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
		link: LinkPlugin,
		// ... etc
	},
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
- `src/plugins/dropdown/blockStyle.js` - Dropdown with SelectMenu module

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

---

## Using the `onload` Event

### Why `onload` Exists

SunEditor's initialization process completes asynchronously. While the editor instance is returned immediately from `suneditor.create()`, some critical initialization steps are deferred to a `setTimeout(..., 0)` callback in the `__editorInit` method ([editor.js:1364-1388](src/core/editor.js#L1364-L1388)).

**Initialization Timeline:**

```
T=0ms:   suneditor.create() starts
T=0ms:   Constructor builds DOM
T=0ms:   Synchronous initialization (plugins, events, content)
T=0ms:   __editorInit() queues setTimeout callback
T=0ms:   User receives editor instance ← YOU HAVE THE INSTANCE
T=1ms:   setTimeout callback executes:
         - Toolbar visibility set
         - ResizeObserver registration
         - History stack reset
         - Resource state initialization
         - onload event fires ← FULLY INITIALIZED
```

**What Happens in the setTimeout Callback:**

1. **Toolbar Visibility** - Toolbar is initially hidden to prevent FOUC (Flash of Unstyled Content), then shown after layout calculations complete
2. **ResizeObserver Registration** - Observers for wysiwyg frame and toolbar are attached after DOM layout is stable
3. **History Reset** - Undo/redo stack is initialized to baseline state
4. **Resource State** - Placeholder visibility, iframe auto-height, and other state updates
5. **`onload` Event** - User callback fires signaling complete initialization

**Why This Design:**

- **SSR Safety**: Prevents crashes in Next.js/Nuxt when instances are destroyed during initialization
- **Layout Stability**: Ensures browser has completed all layout calculations before observers attach
- **Visual Polish**: Prevents toolbar flickering and positioning issues
- **Accurate Measurements**: ResizeObserver gets correct initial dimensions

### When to Use `onload`

You **must** use the `onload` event callback when you need to:

1. **Access editor methods immediately after creation**
2. **Set initial content programmatically**
3. **Integrate with frameworks** (React, Vue, Angular, Svelte)
4. **Register external integrations** (analytics, state management)

#### ❌ DON'T:

1. **Don't call methods immediately after `create()`:**

    ```javascript
    // ❌ WRONG
    const editor = SUNEDITOR.create('editor');
    editor.focus(); // May fail!

    // ✅ CORRECT
    const editor = SUNEDITOR.create('editor', {
    	events: {
    		onload: ({ editor }) => {
    			editor.focus();
    		},
    	},
    });
    ```

2. **Don't assume toolbar is visible:**

    ```javascript
    // ❌ WRONG
    const editor = SUNEDITOR.create('editor');
    const toolbar = editor.context.get('toolbar_main');
    const height = toolbar.offsetHeight; // May be 0!

    // ✅ CORRECT
    onload: ({ editor }) => {
    	const toolbar = editor.context.get('toolbar_main');
    	const height = toolbar.offsetHeight; // Accurate
    };
    ```

3. **Don't start timers before initialization:**

    ```javascript
    // ❌ WRONG
    const editor = SUNEDITOR.create('editor');
    setInterval(() => {
    	saveContent(editor.html.get()); // May fail!
    }, 30000);

    // ✅ CORRECT
    onload: ({ editor }) => {
    	setInterval(() => {
    		saveContent(editor.html.get());
    	}, 30000);
    };
    ```

### What Can Break Without `onload`

The following operations may fail or return incorrect results if called before `onload` fires:

| Operation                  | Issue                              | Reason                               |
| -------------------------- | ---------------------------------- | ------------------------------------ |
| `editor.focus()`           | Focus fails                        | Selection not initialized            |
| `editor.html.get/set()`    | May fail or return incomplete data | HTML class may not be fully injected |
| `editor.char.getLength()`  | Returns 0 or throws                | Character counter DOM not created    |
| `editor.history.*`         | Inconsistent state                 | History not reset                    |
| `toolbar.offsetHeight`     | Returns 0                          | Toolbar hidden                       |
| `editor.selection.*`       | Range errors                       | Selection class not initialized      |
| Toolbar button states      | Incorrect active states            | Tag effects not applied              |
| Iframe height calculations | Wrong dimensions                   | ResizeObserver not registered        |
| Placeholder visibility     | Stays visible                      | Resource state not updated           |

### Summary

The `onload` event is **essential** for reliable editor initialization across all environments. It guarantees that:

✅ All DOM elements are created and visible
✅ ResizeObservers are registered and active
✅ History stack is properly initialized
✅ Core classes (`selection`, `html`, `char`, etc.) are fully injected
✅ Toolbar is visible and positioned correctly
✅ Browser layout calculations are complete

**Always use `onload` when:**

- Integrating with frameworks (React, Vue, Angular, Svelte)
- Setting initial content programmatically
- Calling editor methods immediately after creation
- Measuring dimensions or positions
- Registering external integrations

### Using iframe Mode in Modern Frameworks

SunEditor supports two modes: **DIV mode** (default) and **iframe mode** (`iframe: true`). The iframe mode provides better content isolation but requires special attention in modern frameworks.

#### iframe Security Attributes

SunEditor automatically sets these attributes on iframes:

- `sandbox="allow-same-origin"` - Required for editor functionality
    - `allow-same-origin`: Enables contentDocument access and DOM manipulation from parent window
    - Note: Editor does NOT execute scripts in iframe context (only uses DOM APIs from parent window)
- `allowfullscreen` - Fullscreen API support

#### Common iframe Issue: contentDocument is null

**Symptoms:** `Cannot read property 'head' of null` or `Cannot access iframe document`

**Causes:**

1. Missing `allow-same-origin` in sandbox
2. SSR environment (Next.js/Nuxt)
3. iframe not loaded before access

**Solutions:**

```javascript
// Use dynamic import in Next.js
import dynamic from 'next/dynamic';
const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });

// Custom sandbox (required values will be auto-added)
SUNEDITOR.create('editor', {
	iframe: true,
	iframe_attributes: {
		// allow-same-origin is always added automatically
		sandbox: 'allow-downloads', // Just add your additional permissions
	},
});
```

---

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
