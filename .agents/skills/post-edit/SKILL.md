---
name: post-edit
description: 코드 수정 후 범위에 맞는 lint, 타입 검사, 빌드 검증, 동작 및 성능 테스트 실행
allowed-tools:
  - Bash
---

Validate the intended changes without rewriting unrelated work. Read `git status --short`,
`git diff` and `git diff --cached` first. Never stage, restore or stash to prepare validation.

## Scope

- Documentation/harness-only: run `npm run check:harness`, verify changed API examples at their source,
  then `git diff --check`. Skip source lint, generation and runtime tests.
- Source JS: run the sequence below. Fix formatting only in the changed source files;
  do not start with the repository-wide `lint:fix-js` autofixer on unrelated user work.
- CSS/layout: lint applicable files, build with `npm run build:prod`, and run relevant browser
  cases. Source-only Jest cannot establish layout correctness.
- Test/tooling-only: run the changed tool or relevant test suite and applicable static checks.
  For dependency rules, run both `npm run check:arch` and `npm run test:arch`.
  Commands and CI scope: [Testing and Validation](../../../guide/testing.md).

## Source pipeline

Run sequentially; stop dependent steps on failure, diagnose and rerun only affected checks:

1. `npx --no-install eslint <changed-source-files>`; use `--fix` on those files if necessary.
2. `npm run ts-build` — generates types and runs `check:inject` (writes generated sections).
3. `npm run lint:type` — required separately: `ts-build` contains `tsc || true`, so generation
   exit code alone does not establish type correctness.
4. `npm run check:arch` — import/cycle rules including L3 isolation; review runtime access and allowed-edge symbols.
5. `npm run check:exports` — export sync.
6. `npm test -- --runInBand` — Jest unit AND integration suites.
7. Targeted browser tests for native input, selection, IME, iframe, layout or focus changes:
   `npm run test:e2e -- <relevant-spec> --project=chromium`. Use the configured Firefox project
   for relevant `*.firefox.spec.js` cases. For geometry/direction, run `npm run test:browser -- geometry.spec.js`
   (DIV/iframe × LTR/RTL in Chromium and Firefox). State any untested browser/device behavior.
8. For new features/hot paths/resources, use `prompts/performance-guide.md` to check the
   relevant costs and lifecycle; run `npm run test:perf` for selection/offset paths. Extend the
   benchmark for other hot paths rather than claiming existing coverage. Report fixture/operation/metric.
9. `git diff --check` and inspect final status/diff, including generated artifacts. Do not
   discard unexpected changes with git; identify their source and report them.

Use `npm run build:prod` additionally when bundling, exports, assets or new plugin imports
change. Reuse successful checks from this same task if their inputs have not changed.

`check:langs` is excluded from automatic validation: it uses Google translation credentials
and writes translations. For `en.js` changes, follow `prompts/editing-rules.md` and report
whether translation was actually run. Do not claim a skipped step passed.

Report each applicable step as pass/fail/skipped (with reason), test counts, and any remaining
failure. Check causal relevance before calling a failure pre-existing; use an isolated
worktree for baseline evidence when needed. Never alter the user's index or shared WIP.
