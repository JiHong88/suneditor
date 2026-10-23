# GUIDE.md

> **Purpose:**
> Technical reference for developers and AI agents.
> Navigation and developer reference. Authoritative contracts live in the linked architecture, coding, editing and testing guides.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Directory Structure](#directory-structure)
- [Technical Requirements](#technical-requirements)
- [Architecture](#architecture) (overview) | [ARCHITECTURE.md](./ARCHITECTURE.md) (deep dive)
    - [Plugin System](#plugin-system-srcplugins)
    - [Modules](#modules-srcmodules)
- [Essential Commands](#essential-commands)
    - [Project Agent Skills](#project-agent-skills-agentsskills)
- [Naming Conventions](#naming-conventions)
- [Common Pitfalls](#common-pitfalls)
- [Plugin Registration Flow](#plugin-registration-flow)
- [Example Implementations](#example-implementations)
- [Testing Strategy](#testing-strategy)
- [Initialization: `onload` Event](#initialization-onload-event)
- [iframe Mode](#iframe-mode)
- [Markdown View](#markdown-view)
- [Build System](#build-system)
- [Changes Log](#changes-log)
- [Supplementary Guides](#supplementary-guides)
    - [Performance and Feature Guide](./prompts/performance-guide.md) - Reuse map, event/resource costs and targeted validation
    - [Coding Rules](./prompts/coding-rules.md) - Enforceable conventions for `src/*.js`
    - [Editing Rules](./prompts/editing-rules.md) - File-level edit restrictions
    - [Custom Plugin Guide](./guide/custom-plugin.md) - Creating custom plugins
    - [External Libraries](./guide/external-libraries.md) - CodeMirror, KaTeX, MathJax
    - [Type Definitions](./guide/typedef-guide.md) - SunEditor namespace types

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
├── src/
│   ├── core/
│   │   ├── kernel/          # L1: Dependency container & state
│   │   ├── config/          # L2: Configuration & providers
│   │   ├── logic/
│   │   │   ├── dom/         # DOM manipulation (selection, format, inline, html, ...)
│   │   │   ├── shell/       # Editor operations (component, history, focus, ...)
│   │   │   └── panel/       # Panel UI (toolbar, menu, viewer)
│   │   ├── event/           # L4: Event orchestration (Redux-like)
│   │   │   ├── actions/
│   │   │   ├── handlers/
│   │   │   ├── reducers/
│   │   │   ├── rules/
│   │   │   ├── effects/
│   │   │   └── support/
│   │   ├── schema/          # Data definitions (context, options)
│   │   └── section/         # DOM construction
│   ├── plugins/
│   │   ├── command/         # Direct actions
│   │   ├── dropdown/        # Dropdown menus
│   │   ├── modal/           # Dialog plugins
│   │   ├── browser/         # Gallery plugins
│   │   ├── field/           # Autocomplete
│   │   ├── input/           # Toolbar inputs
│   │   └── popup/           # Inline controllers
│   ├── modules/
│   │   ├── contract/        # Module contracts (Modal, Controller, Figure, ...)
│   │   ├── manager/         # Managers (FileManager, ApiManager)
│   │   └── ui/              # UI utilities (SelectMenu, ModalAnchorEditor)
│   ├── hooks/               # Hook interface definitions
│   ├── interfaces/          # Plugin base classes & contracts
│   ├── helper/              # Pure utility functions
│   │   └── dom/             # DOM utilities
│   ├── assets/              # Static assets (icons, CSS, design)
│   ├── langs/               # i18n language files
│   └── themes/              # CSS theme files
├── test/
│   ├── unit/
│   ├── integration/
│   ├── e2e/                # Native editing regressions
│   └── browser/            # CI geometry contracts and performance budgets
├── types/                   # Generated TypeScript definitions
├── webpack/                 # Build configuration
└── dist/                    # Built bundles (not tracked in git)
```

## Technical Requirements

**Runtime Environment:**

- **JavaScript**: ES2022+ (modern browsers only)
- **Zero dependencies**: No external libraries in production bundle

**Development Environment:**

- **Node.js**: **v22** for repository tooling and CI (the package engines field is not a toolchain guarantee)
- **Build tools**: Webpack 5, Babel, ESLint, Prettier

**Type System:**

- **JSDoc** for inline type annotations in source files
- **TypeScript** for type checking (no TS source files, only generated `.d.ts`)
- Generated types: `npm run ts-build`

**Testing Stack:**

- **Unit/Integration**: Jest with jsdom
- **Browser**: Playwright (Chromium and Firefox)
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

Initialization and dependency availability are defined in [the two-phase injection strategy](./ARCHITECTURE.md#the-2-phase-injection-strategy). Wait for `onload` before using initialized editor UI.

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

Plugins receive `this.$` through `super(kernel)`; it is the Deps bag, not the Kernel.
Use the [plugin shape](./prompts/coding-rules.md#9-plugin-shape) for source conventions and
[Custom Plugin Guide](./guide/custom-plugin.md) for JavaScript/TypeScript examples, module
contracts and multi-interface composition. The [Deps reference](./ARCHITECTURE.md#the--deps-object)
lists available services.

#### Plugin Hooks & Methods Reference

The [Custom Plugin Guide](./guide/custom-plugin.md) owns hook tables, signatures and examples.
Hook order and cancellation belong to the [event system](./ARCHITECTURE.md#9-event-system).
Keep repeated `active()` hooks synchronous and local to the supplied node; see the
[performance guide](./prompts/performance-guide.md#event-and-resource-costs).

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

**Architecture Pattern**: Standalone utilities with no editor-layer imports; prefer pure functions. DOM helpers mutate nodes, and utilities such as `debounce` hold per-call closure state.

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

Global `context` holds shared UI references; `frameContext` and `frameOptions` are moving views
of the active root. Per-root ownership and storage are defined in
[Multi-Root Architecture](./ARCHITECTURE.md#7-multi-root-architecture). Async work must retain
its originating frame, rather than trusting the active view after an `await`.

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

Commands, browser installation, CI coverage and benchmark budgets are maintained in
[Testing and Validation](./guide/testing.md). For changed code, follow the
[post-edit pipeline](./.agents/skills/post-edit/SKILL.md).

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

### Project Agent Skills (`.agents/skills/`)

Shared across agents; `.claude/skills` is a symlink. Read the relevant `SKILL.md` if the host has no skill invocation tool.

Invoke these project skills using the current host’s supported skill mechanism.

| Command         | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| `/post-edit`    | Scope-specific validation; authoritative order in the [skill](./.agents/skills/post-edit/SKILL.md) |
| `/code-review` | Review behavior, resource/performance regressions and project contracts (report only)                |
| `/changes`      | Analyze git diff and update `changes.md` (for manual edits only)                         |
| `/release-note` | Convert `changes.md` to release note format                                              |

---

## Naming Conventions

**File Naming:**

- **JavaScript files**: camelCase (e.g., `selection.js`, `eventManager.js`)
- **Class files**: Preserve the directory convention and exact case (`modules/contract/Modal.js`, but `core/logic/dom/selection.js`)
- **Plugin files**: Match plugin key (e.g., `blockquote.js` for key `'blockquote'`)

**Code Naming:**

- **Classes**: PascalCase (e.g., `KernelInjector`, `Modal`, `CoreKernel`)
- **Functions/Methods**: camelCase (e.g., `getRange`, `setContent`, `applyTagEffect`)
- **Private fields/methods**: `#privateField`, `#privateMethod()` (ES2022)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ACTION_TYPE`, `EVENT_TYPES`)

**Plugin Naming:**

- **Plugin keys**: case-sensitive registration strings (e.g., `'image'`, `'video'`, `'blockStyle'`); preserve spelling in `buttonList` and options
- **Plugin types**: lowercase string (e.g., `'command'`, `'modal'`, `'dropdown'`)
- **Plugin class names**: PascalCase (e.g., `Blockquote`, `Link`, `Image`)

**CSS Naming:**

- **Prefix**: All classes start with `se-` (e.g., `se-wrapper`, `se-component`)
- **Component classes**: `se-component`, `se-flex-component`, `se-inline-component`

---

## Common Pitfalls

Use the [coding checklist](./prompts/coding-rules.md#quick-checklist) for events, shared DOM
methods, state, history and iframe/RTL behavior. API names are not proof of ownership: trace
the actual caller before adding a history push, listener or async cleanup path.

---

## Plugin Registration Flow

Pass plugin **classes** in `options.plugins`; `PluginManager` constructs them with the Kernel
and owns their lifecycle. Source contracts are in [Plugin shape](./prompts/coding-rules.md#9-plugin-shape);
runtime activation is in [Toolbar button → plugin activation](./ARCHITECTURE.md#toolbar-button--plugin-activation).

---

## Example Implementations

Trace the closest existing implementation and its callers before extending a feature:

| Responsibility | Starting point |
| --- | --- |
| Command / dropdown | `src/plugins/command/blockquote.js`, `src/plugins/dropdown/align.js` |
| Modal and component | `src/plugins/modal/link.js`, `src/plugins/modal/image/index.js` |
| Selection and formatting | `src/core/logic/dom/selection.js`, `src/core/logic/dom/format.js` |
| Shared UI contract | `src/modules/contract/Modal.js`, `src/modules/contract/Controller.js` |
| Keyboard editing | `src/core/event/handlers/handler_ww_key.js`, `reducers/keydown.reducer.js`, `rules/keydown.rule.enter.js` |

The [reuse map](./prompts/performance-guide.md#reuse-map) lists shared owners by behavior.
The [event pipeline](./ARCHITECTURE.md#event-pipeline-internal) explains handlers, decisions and effects.

---

## Testing Strategy

[Testing and Validation](./guide/testing.md) is the command and coverage reference.
Use behavioral assertions for jsdom, real browsers for native editing/geometry, and explicit
work budgets for repeated paths. Passing coverage alone does not establish those contracts.

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

## Build System

- **Webpack** for bundling (config in `webpack/`)
- **Babel** (`@babel/preset-env`) with Browserslist targets
- **ESLint** with Prettier for code quality
- **Output**: `dist/suneditor.min.js` and `dist/suneditor.min.css`

The `dist/` folder is NOT tracked in git and is built via CI/CD.

---

## Changes Log

For user-facing changes, update `changes.md` using
[prompts/changes-guide.md](./prompts/changes-guide.md), the sole formatting authority.
Use `### feat`, `### fix`, `### change`, `### breaking` groups and concise bullets with
source/plugin references. Do not use dated category headings. Skip documentation/harness,
tests and internal-only changes. Clear the log only after release completion or an explicit
request, not while drafting release notes.

---

## Supplementary Guides

- [Performance and Feature Guide](./prompts/performance-guide.md) - Reuse map, event/resource costs and targeted validation
- [Coding Rules](./prompts/coding-rules.md) - Enforceable conventions for `src/*.js` (events, DOM, state, history, plugin shape)
- [Editing Rules](./prompts/editing-rules.md) - File-level edit restrictions (generated files, lang files, sync rules)
- [Custom Plugin Guide](./guide/custom-plugin.md) - Creating custom plugins
- [External Libraries](./guide/external-libraries.md) - CodeMirror, KaTeX, MathJax integration
- [Type Definitions](./guide/typedef-guide.md) - SunEditor namespace types reference
