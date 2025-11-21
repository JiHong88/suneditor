# 🌞 Guidelines For Contributing

---

## 📘 Introduction

The codebase is written in **JavaScript**, using **JSDoc** for type definitions.
Node.js **v22 recommended**, minimum **v14+** is required to build and test.

### 📝 Notes

- **Polyfills are not included**. Make sure your target environment (browser or runtime) natively supports these features.
- Target ECMAScript version: **ES2022**
- Supported browsers: [See Browser Support](./README.md#-browser-support)

---

## 🐛 Before Submitting an Issue

- Make sure you're using the latest `master` branch. Your issue may already be fixed.
- Search the [open issues](https://github.com/jihong88/suneditor/issues) and [closed issues](https://github.com/jihong88/suneditor/issues?q=is%3Aissue+is%3Aclosed) to avoid duplicates.
- If your issue is new, [file a ticket](https://github.com/jihong88/suneditor/issues/new) with detailed info, including reproduction steps if possible.

---

## ✅ Before Submitting a PR

- Check that no one is working on the same thing in [open issues](https://github.com/jihong88/suneditor/issues).
- For new features or major changes, please open an issue first to gather feedback.
- Use a **feature branch** (not `master`) for your pull request.
- Make sure your code passes tests and doesn't break existing functionality.
- Follow the [Commit Message Convention](#-commit-message-convention) below.

---

## 🤝 How to Contribute

We welcome code contributions, bug reports, documentation improvements, or plugin ideas!

### 🧹 Code Formatting

- Use the provided **ESLint** configuration.
- 4-space indentation
- Single quotes (`'`) for strings
- Run `npm run lint:fix-all` to auto-fix formatting issues

---

## 🧩 Plugin Development

SunEditor supports a modular plugin architecture where features can be enabled/disabled as needed.

### Getting Started

1. **Read the documentation**:
    - [Plugin API Reference](https://suneditor.com/plugin-guide)
    - [GUIDE.md - Plugin System](./GUIDE.md#plugin-system-srcplugins)

2. **Explore existing examples**:
    - Simple command: [src/plugins/command/blockquote.js](src/plugins/command/blockquote.js)
    - Modal dialog: [src/plugins/modal/link.js](src/plugins/modal/link.js)
    - Dropdown menu: [src/plugins/dropdown/align.js](src/plugins/dropdown/align.js)

3. **Create your plugin**:
    - Extend `EditorInjector` class
    - Implement required methods (`action()`, `open()`, etc.)
    - Add static properties (`key`, `type`, `className`)
    - Export and register in options

---

## 🔁 CI/CD

📦 The `dist/` folder is **not included** in the git repository.  
⚙️ It is automatically built and deployed via **GitHub Actions** after changes are pushed to the `release` branch.  
🛑 **Do not build or commit `dist/` files manually** – this may cause merge conflicts.  
✅ The CI/CD pipeline ensures clean and consistent builds for every release.

---

## ⚙️ Framework Guide

If you're contributing to framework integrations:

- React: [suneditor-react](https://github.com/JiHong88/suneditor-react)
- Vue: [suneditor-vue](https://github.com/JiHong88/suneditor-vue)

💡 Feel free to propose wrappers for other frameworks too!

---

## 🔧 Development Setup

### Essential Commands

[guide@Essential Command](./GUIDE.md#essential-commands)

---

## 🤖 AI Plugin Helper

Need real-time help?

Check out **[SunEditor Devs AI](https://chatgpt.com/g/g-JViNPCrkD-suneditor-devs)** –

> 💡 Just paste your code or describe your plugin idea – and get instant support.

---

## 🗂️ Architecture Guide

For detailed architecture documentation, see **[GUIDE.md](./GUIDE.md)**.

Key sections:

- [Overall Architecture](./GUIDE.md#overall-architecture)
- [Plugin System](./GUIDE.md#plugin-system-srcplugins)
- [Core Components](./GUIDE.md#core-components-srccore)
- [Common Development Patterns](./GUIDE.md#common-development-patterns)
- [Testing Strategy](./GUIDE.md#testing-strategy)

---

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) style for clear and consistent commit history.

### Commit Types

| Type       | Usage                                          | Example                                  |
| ---------- | ---------------------------------------------- | ---------------------------------------- |
| `feat`     | New feature                                    | `feat: add image edit tool`              |
| `fix`      | Bug fix                                        | `fix: resolve table merge issue`         |
| `refactor` | Code refactoring (no functional change)        | `refactor: improve toolbar render logic` |
| `perf`     | Performance optimization                       | `perf: optimize cursor position restore` |
| `docs`     | Documentation changes (README, comments, etc.) | `docs: add README usage example`         |
| `style`    | Code style changes (formatting, semicolons)    | `style: fix indentation and whitespace`  |
| `test`     | Add or modify tests                            | `test: add merge case unit test`         |
| `chore`    | Build setup, package management, misc tasks    | `chore: clean webpack config`            |
| `ci`       | CI/CD configuration changes                    | `ci: add GitHub Actions deploy workflow` |
| `build`    | Build system changes                           | `build: update babel to latest version`  |

### Issue Linking

Connect commits to issues using these formats:

| Format             | Example                          | Description                          |
| ------------------ | -------------------------------- | ------------------------------------ |
| `feat(#1234): ...` | `feat(#1541): add table merge`   | Conventional Commits (tool-friendly) |
| `fix: #1234 ...`   | `fix: #1541 resolve paste error` | Simple GitHub integration            |

### Writing Tips

- Keep title under **50 characters**
- Use **lowercase** for type
- Omit **trailing period**
- Leave blank line after title before body (optional)
- Explain **what** and **why** in the body
- Link related issues with `Closes #1234` or `Fixes #5678`

### Example

```text
feat(#1541): add table cell merge functionality

- Implement horizontal and vertical merge
- Add merge/unmerge buttons to table controller
- Update table serialization logic

Closes #1541
```

---

Thanks for contributing 💛
You're helping make SunEditor better for everyone!
