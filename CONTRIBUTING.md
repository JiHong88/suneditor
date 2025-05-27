# 🌞 Guidelines For Contributing

---

## 📘 Introduction

The codebase is written in **JavaScript (ES2020)**, using **JSDoc** for type definitions.  
Node.js **v14 or higher** is required to build and test.

### 📝 Notes

-   Uses modern syntax including:
    -   Optional chaining (`?.`)
    -   Nullish coalescing (`??`)
    -   Private class fields (`#myField`)
-   Polyfills are **not included** – make sure your target environment supports these features.

---

## 🐛 Before Submitting an Issue

-   Make sure you're using the latest `master` branch. Your issue may already be fixed.
-   Search the [open issues](https://github.com/jihong88/suneditor/issues) and [closed issues](https://github.com/jihong88/suneditor/issues?q=is%3Aissue+is%3Aclosed) to avoid duplicates.
-   If your issue is new, [file a ticket](https://github.com/jihong88/suneditor/issues/new) with detailed info, including reproduction steps if possible.

---

## ✅ Before Submitting a PR

> [commit-guide](./guide/commit-types.md)

-   Check that no one is working on the same thing in [open issues](https://github.com/jihong88/suneditor/issues).
-   For new features or major changes, please open an issue first to gather feedback.
-   Use a **feature branch** (not `master`) for your pull request.
-   Make sure your code passes tests and doesn’t break existing functionality.

---

## 🤝 How to Contribute

We welcome code contributions, bug reports, documentation improvements, or plugin ideas!

### 🧹 Code Formatting

-   Use the provided **ESLint** configuration.
-   4-space indentation
-   Single quotes (`'`) for strings

---

## 🧩 Plugin Development

SunEditor allows custom plugins using a flexible API.

📘 Start from the [Plugin API Reference](https://suneditor.com/api/plugins)  
🔍 Or explore the `src/plugins/` folder to see real examples.

---

## 🔁 CI/CD

📦 The `dist/` folder is **not included** in the git repository.  
⚙️ It is automatically built and deployed via **GitHub Actions** after changes are pushed to the `release` branch.  
🛑 **Do not build or commit `dist/` files manually** – this may cause merge conflicts.  
✅ The CI/CD pipeline ensures clean and consistent builds for every release.

---

## ⚙️ Framework Guide

If you're contributing to framework integrations:

-   React: [suneditor-react](https://github.com/JiHong88/suneditor-react)
-   Vue: [suneditor-vue](https://github.com/JiHong88/suneditor-vue)

💡 Feel free to propose wrappers for other frameworks too!

---

## 🤖 AI Plugin Helper

Need real-time help?

Check out **[SunEditor Devs AI](https://chatgpt.com/g/g-JViNPCrkD-suneditor-devs)** –

> 💡 Just paste your code or describe your plugin idea – and get instant support.

---

## 🗂️ Code Architecture

A quick overview of the `src/` directory:

### `/core/` – 🧠 Editor Core Logic

-   `editor.js`: Defines the main Editor class, managing lifecycle, commands, and overall orchestration
-   `section/`: Context management and document setup
-   `class/`: Core classes like toolbars, selections, HTML parsing, etc.
-   `base/`: Undo/redo history, event manager, and shared core logic

### `/helper/` – 🛠️ Utility Functions

-   String converters, clipboard helpers, DOM queries
-   `helper/dom/`: Low-level DOM operations

### `/modules/` – 🧩 Reusable UI Modules

-   Functional components like:
    -   `Modal`, `ColorPicker`, `SelectMenu`, `FileManager`, etc.
-   Useful for building consistent plugin UIs

### `/editorInjector/` – 🧬 Plugin Integration Point

-   Wraps and initializes the core editor
-   Plugins must inherit from this to register correctly

### `/plugins/` – ✨ Feature Extensions

-   Modular plugins organized by type:
    -   Examples: `image`, `video`, `link`, `blockquote`, etc.
-   Each plugin is isolated and optional

### `/langs/` – 🌍 i18n Support

-   Language packs in separate JS files

### `/assets/` – 🎨 Styles & Icons

-   CSS for editor layout and themes
-   SVG icon sets (`icons/defaultIcons.js`)

### `/themes/` – 🧪 Theme Stylesheets

-   Includes variants like `dark.css`

### `suneditor.js` – 🚪 Main Entry Point

-   Bootstraps and exports the editor instance

---

## 🚀 Useful Commands

> [scripts-guide](./guide/scripts-guide.md)

```bash
# Start local dev server
npm run dev

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# lint
npm run lint

# Auto-fix JavaScript issues
npm run lint:fix-js

# Auto-fix TypeScript issues
npm run lint:fix-ts

# ✅ Run before committing!
# Fix all lint issues (JS + TS)
npm run lint:fix-all

# Build types and update barrels
npm run ts-build

# Sync language files (base: en.js)
npm run i18n-build

# test
npm run test
```

---

Thanks for contributing 💛
You're helping make SunEditor better for everyone!

```

```
