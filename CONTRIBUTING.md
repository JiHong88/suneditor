# Guidelines For Contributing

## Introduction

The codebase is written in JavaScript (ES2020), with JSDoc used for type definitions.  
Node.js v14 or higher is required to build and test.

### Notes

-   Uses modern syntax including:
    -   Optional chaining (`?.`)
    -   Nullish coalescing (`??`)
    -   Private class fields (`#myField`)
-   Polyfills are **not included** – make sure your target environment supports these features.

---

## 🐛 Before submitting an issue

-   Make sure you're using the latest `master` branch. Your issue may have already been fixed.
-   Search the [open issues](https://github.com/jihong88/suneditor/issues) and [closed issues](https://github.com/jihong88/suneditor/issues?q=is%3Aissue+is%3Aclosed) to avoid duplicates.
-   If your issue is new, [file a ticket](https://github.com/jihong88/suneditor/issues/new) with detailed info, including reproduction steps if possible.

---

## ✅ Before submitting a PR

-   Check that no one is working on the same thing in [open issues](https://github.com/jihong88/suneditor/issues).
-   If you're proposing a new feature or major change, please open an issue first to gather feedback.
-   Use a feature branch (not `master`) for your pull request.
-   Make sure your code passes existing tests and doesn't break functionality.

---

## 🤝 How to contribute

We welcome code contributions, bug reports, documentation improvements, or plugin ideas!

### Source Formatter

Please format your code using the provided ESLint configuration.  
Use 4-space indentation and single quotes for strings.

## 🧩 Plugin Development

SunEditor allows custom plugins using a flexible API.

Start from this guide:  
📘 [Plugin API Reference](https://suneditor.com/api/plugins)

Or explore the plugin folder in the repo for real examples.

---

## ⚙️ Framework Guide

If you're contributing to framework integrations:

-   React: [suneditor-react](https://github.com/JiHong88/suneditor-react)
-   Vue: [suneditor-vue](https://github.com/JiHong88/suneditor-vue)

Feel free to propose wrappers for other frameworks too!

---

## 🤖 AI Plugin Helper

ChatGPT assistant

Check out **[SunEditor Devs AI](https://chatgpt.com/g/g-JViNPCrkD-suneditor-devs)** –

> 💡 Just paste your code or describe your plugin idea – and get real-time support.

---

## 🗂️ Code Architecture

Here's a brief overview of the `src/` directory:

-   **`/core`**  
    The heart of the editor. This folder includes the base architecture, editor lifecycle, event handling, and UI behavior.
    -   `section/`: Manages context, constructor, document structure
    -   `class/`: Handles toolbars, menus, selections, HTML parsing, etc.
    -   `base/`: General base modules such as event manager and undo history
-   It is written in prototype syntax.

-   **`/helper`**  
    Lightweight utility functions used throughout the codebase.

    -   Includes string converters, DOM querying helpers, clipboard handling, environment checks, and more.
    -   `helper/dom/` provides low-level DOM manipulation functions.

-   **`/modules`**  
     Reusable logic or UI components used across plugins.
    These are not utilities, but functional modules like:

    -   `Modal`, `ColorPicker`, `Controller`, `FileManager`, `SelectMenu`, `HueSlider`, etc.
    -   Useful for building consistent interactive features.

-   **`/editorInjector`**  
     A wrapper that injects specific configurations and initializes the core editor.
    When defining a plugin, you must inherit it.

-   **`/plugins`**  
    Feature modules that extend the editor's capabilities. Organized by type (e.g., dropdown, modal, command).

    -   Each plugin is isolated and can be enabled/disabled as needed.
    -   Examples: image, video, link, font, blockquote, etc.

-   **`/langs`**  
    Internationalization support. Each language is a separate JS file.

-   **`/assets`**  
    Contains UI styling and editor-specific icon sets.

    -   CSS files for the editor and themes
    -   Default SVG icon definitions (`icons/_default.js`)

-   **`/themes`**  
    Theme-specific stylesheets. (e.g., `dark.css`)

-   **`suneditor.js`**  
    The main entry point. Initializes and exports the editor instance.

---

### Useful Commands

```bash
# Start local dev server
npm run dev

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# Lint JavaScript
npm run lint

# Auto-fix JavaScript issues
npm run lint:fix-js

# Auto-fix TypeScript issues
npm run lint:fix-ts

# Fix all lint issues (JS + TS)
npm run lint:fix-all

# Build types and update barrels
npm run ts-build

# Sync languages base en.js
npm run i18n-build

# Run tests
npm run test
```

> [scripts/README](https://github.com/JiHong88/suneditor/blob/develop/scripts/README.md)

---

Thanks for contributing 💛  
You're helping make SunEditor better for everyone!
