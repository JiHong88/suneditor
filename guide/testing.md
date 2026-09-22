# Testing and Validation

This is the command and coverage reference. The [post-edit skill](../.agents/skills/post-edit/SKILL.md)
owns validation order and scope; the [performance guide](../prompts/performance-guide.md) owns
feature design and cost decisions. CI uses Node 22 with `npm ci`; use that version to reproduce its toolchain.

## Commands and CI

| Command | Contract | CI |
| --- | --- | --- |
| `npm test -- --runInBand` | Jest unit and integration behavior | Via coverage step |
| `npm run test:coverage -- --runInBand` | Same suites; thresholds in `jest.config.js` | Yes |
| `npm run check:arch` | Runtime import boundaries on actual source | Via static checks |
| `npm run test:arch` | Real dependency-cruiser accepts valid graphs and rejects invalid graphs | Yes |
| `npm run check:exports` | Source/CDN/type export sync | Yes |
| `npm run check:harness` | Local Markdown links/anchors, documented npm scripts, skill name/description and aliases | Yes, including docs-only changes |
| `npm run test:browser` | Geometry contracts and deterministic performance budgets, Chromium + Firefox | Yes |
| `npm run test:perf` | Performance cases only, one worker, both browsers | Included in browser step |
| `npm run test:e2e` | Existing native editing regressions on the development fixture | Local targeted validation |
| `npm run test:all` | Jest, architecture guardrail tests and both Playwright configurations | Local comprehensive run |

The [CI workflow](../.github/workflows/test-coverage.yml) uses one job for master pushes and
PRs. Checkout and Node setup happen once. The dependency-free
[selector](../scripts/ci/select-checks.cjs) decides which steps to run, and `npm ci` runs at
most once. npm downloads are cached only when installation is needed.

| Step | Changes that select it |
| --- | --- |
| Harness, CI routing and Codex hook tests | Every run; no dependency installation needed |
| Static checks | Source JS/types, lint/type/dependency rules, architecture test, export checker and its source/CDN/type formatter inputs, or dependencies |
| Coverage | Jest inputs: source JS (including JS assets), unit/integration tests, shared mocks/setup, Jest/Babel config and dependencies; unknown paths remain eligible |
| Browser contracts | Source/assets/themes, `test/browser`, its Playwright config, browser webpack config and `_common`, Babel config, or dependencies |
| All checks | The CI workflow or `scripts/ci` code changes, a manual run, or an unavailable Git comparison |

Markdown-only changes skip dependency/cache/browser installation and run only the lightweight
harness, routing and hook checks. Coverage keeps its exclusions for documentation/harness files,
CSS/themes, scripts, webpack, generated types, Playwright tests/configs, developer demos and
unrelated metadata. These rules now live in the selector rather than workflow-level
`paths-ignore`, allowing the harness to run even when runtime checks are unnecessary.
They control execution, not Jest's `collectCoverageFrom` or thresholds. Mixed changes select
the union of their checks. JS assets remain eligible because editor construction imports them
even when their lines are excluded from metrics.

PRs compare the merge base to the PR head, including earlier commits in the PR. Pushes compare
`before` to `after`, including all commits in that push. Checkout includes full history for
local comparisons without GitHub's changed-file API limits. Renames include both old and new
paths. Missing history (for example after a force push) selects all checks. The selected flags
and comparison reason appear in the GitHub run summary.

After successful dependency installation, selected checks run sequentially. A failed check
keeps the job failed while other selected checks still run; cancellation or failed installation
stops dependent work. Coverage and browser artifacts are uploaded only if their producing
steps actually ran. Independent translation/generation/release tools and the existing native
E2E fixture still require task-specific validation when changed.

Run `node --test scripts/ci/select-checks.test.cjs scripts/hooks/codex-post-tool-use.test.cjs`
to validate routing, comparison failure handling, GitHub output formatting and edit hooks
without installing packages. Changing the workflow also
requires validating step conditions and the single-install invariant. Configuring a workflow
is not evidence that a hosted CI run has passed.

The existing `playwright.config.js` uses port 8088 and limits Firefox to `*.firefox.spec.js`.
The separate [contract configuration](../playwright.contracts.config.js) serves
`test/browser/fixture.js` on port 8089, includes the real editor CSS, and runs every contract
on both browsers. It starts its own server in CI and can reuse a local one.

```bash
npx --no-install playwright install --with-deps chromium firefox
npm run test:browser -- geometry.spec.js
npm run test:perf
npx --no-install playwright show-report
```

Browser results include HTML, JSON, failure screenshots and traces. The CI `browser-contracts`
artifact retains `playwright-report/` and `test-results/` for seven days. Each performance case
attaches JSON samples with browser version, fixture sizes, operation counts, median and p95.

## Agent edit hooks

[Codex hooks](../.codex/hooks.json) call [the edit checker](../scripts/hooks/codex-post-tool-use.cjs)
after `apply_patch`. It reads the patch from `tool_input.command`, resolves paths against the
event's `cwd`, and checks existing `src/**/*.js` files in one local ESLint invocation. Added
and moved files are included; deleted paths and paths outside this repository are not linted.
It does not install packages or apply lint fixes. Node and the project's installed ESLint are required.

Changes to the option schema and Backspace/Delete rules add the owning checklist as
`hookSpecificOutput.additionalContext`. Lint or hook-input failures return blocking feedback;
the edit has already happened and is not rolled back. Shell-based file writes are outside this
`apply_patch` hook, so the [post-edit workflow](../.agents/skills/post-edit/SKILL.md) still applies.

Codex must trust the project and the current hook definition before running it. Review new or
changed definitions with `/hooks` in the Codex CLI; see the [official hook contract](https://learn.chatgpt.com/docs/hooks).
[Claude's hooks](../.claude/settings.json) use its separate `tool_input.file_path` contract.
The Codex regression tests run in the existing CI job before dependency installation and use
a fixture ESLint process; they do not replace source lint or establish host trust/execution.

## Behavioral contracts

- EventManager tests dispatch real events: exact removal handles/capture options, array targets,
  host/iframe global listeners, repeated binding/removal, teardown and public-hook cancellation.
- Destroy tests initialize actual editors/plugins and verify delayed history cancellation,
  listener inactivity after destruction, cleared registries and a surviving second editor.
  These are resource-lifecycle assertions, not JavaScript heap/garbage-collection measurements.
- Geometry uses native rectangles as an independent oracle: DIV/iframe × LTR/RTL, simultaneous
  host/editor scroll, selection rectangles, popup alignment, both viewport edges and direction
  reversal/restoration. jsdom cannot prove these layout contracts.
- Architecture fixtures exercise both sides of each new boundary, including exact allowed
  ownership edges, root/directory plugin combinations and plugin-barrel bypasses. See
  [Layer Dependency Rules](../ARCHITECTURE.md#layer-dependency-rules) for static-analysis limits.

These browser contracts do not replace native typing/IME tests, mobile/WebKit coverage,
multi-root async races, or feature-specific dropdown/controller interaction tests. Run or add
the relevant cases when those paths change; see the [validation matrix](../prompts/performance-guide.md#validation-proportional-to-the-change).

## Performance baseline and budgets

[performance-budgets.json](../test/browser/performance-budgets.json) is the versioned baseline.
Each scenario uses 50 and 2,000 paragraphs, including nested inline content; DIV and iframe;
alignment plugin enabled and disabled; 20 warmup operations, then 20 samples × 50 operations.
The selection workload alternates a nested centered paragraph and a right-aligned paragraph,
checks the actual caret/toolbar result, then checks repeated unchanged selection and offsets.

Initial local measurements (macOS, Node 24.14.0; Chromium 141.0.7390.37 and Firefox 142.0.1;
2026-09-21) matched:

| Metric per operation | Baseline / enforced ceiling |
| --- | --- |
| Whole-root query, serialization or TreeWalker creation | 0 for all measured paths |
| History pushes during selection/geometry | 0 |
| Alignment `active()` calls, enabled | Average 2 across alternating selection updates |
| Alignment calls when absent, or selection unchanged | 0 |
| Explicit rectangle reads for selection updates | 0 |
| Explicit rectangle reads for `offset.getGlobal` | DIV: 1; iframe: 2 |
| Counter growth from 50 to 2,000 paragraphs | None |

These counters are enforced; elapsed milliseconds are recorded for investigation, not used
as a noisy shared-runner threshold. Use `npm run test:perf` with the same machine/browser and
fixture for timing comparisons. Samples are batch averages; timer resolution can produce zero.
Instrumentation and browser-native selection costs affect timing, so this is not a production
input-latency benchmark or a claim that enabling a plugin improves performance.

The probes observe the named root APIs and explicit rectangle reads, not every traversal,
allocation, layout flush, network request or bundle cost. Test-only wrappers verify their
own realm coverage and restore originals in `finally`; production methods are unchanged.
For another hot path, add a representative workload and an output assertion. Change a budget
only with measured evidence and a reason for the additional work; never loosen it just to
make a regression pass. For layout-latency claims, also collect a browser performance trace.
