---
name: post-edit
description: 코드 수정 후 lint, 빌드, 검증, 테스트 파이프라인 실행
allowed-tools:
  - Bash
---

Run the post-edit pipeline after code modifications.

Steps (run sequentially, stop on failure):
1. `npm run lint:fix-js` — ESLint auto-fix
2. `npm run ts-build` — type generation (includes check:inject)
3. `npm run check:arch` — dependency architecture check
4. `npm run check:exports` — export sync check
5. `npm run test` — unit tests

Note: `check:langs` is excluded (requires Google API key).

Report results as a summary table:

| Step | Result |
|------|--------|
| lint:fix-js | pass/fail |
| ts-build | pass/fail |
| check:arch | pass/fail |
| check:exports | pass/fail |
| test | pass/fail (N passed, N failed) |
