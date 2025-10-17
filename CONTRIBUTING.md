# 🌞 Guidelines For Contributing

---

## 📘 Introduction

The codebase is written in **JavaScript**, using **JSDoc** for type definitions.  
Node.js **v14 or higher** is required to build and test.

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

> [commit-guide](./guide/commit-types.md)

- Check that no one is working on the same thing in [open issues](https://github.com/jihong88/suneditor/issues).
- For new features or major changes, please open an issue first to gather feedback.
- Use a **feature branch** (not `master`) for your pull request.
- Make sure your code passes tests and doesn’t break existing functionality.

---

## 🤝 How to Contribute

We welcome code contributions, bug reports, documentation improvements, or plugin ideas!

### 🧹 Code Formatting

- Use the provided **ESLint** configuration.
- 4-space indentation
- Single quotes (`'`) for strings

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

- React: [suneditor-react](https://github.com/JiHong88/suneditor-react)
- Vue: [suneditor-vue](https://github.com/JiHong88/suneditor-vue)

💡 Feel free to propose wrappers for other frameworks too!

---

## 🤖 AI Plugin Helper

Need real-time help?

Check out **[SunEditor Devs AI](https://chatgpt.com/g/g-JViNPCrkD-suneditor-devs)** –

> 💡 Just paste your code or describe your plugin idea – and get instant support.

---

## 🗂️ Architecture guide

**[GUIDE.md](./GUIDE.md)**

---

Thanks for contributing 💛
You're helping make SunEditor better for everyone!

```

```
