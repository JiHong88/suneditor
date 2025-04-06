# 🛠 Scripts

## i18n-sync.cjs

자동 번역 스크립트. 언어 파일을 기준으로 누락된 키를 Google Cloud Translation API를 통해 자동 번역합니다.

-   실행: `npm run i18n-build`
-   [🔗 API 설정 가이드](./docs/i18n-build--translate-setup)

---

## [fix-langs, remove-this-params, rename-index, wrap-dts].cjs

이 빌드 과정은 JSDoc + JavaScript 기반의 코드로부터 .d.ts 파일을 생성하고, 추가적으로 구조 보정 및 포맷 정리를 수행합니다.

-   실행: `npm run ts-build`
-   [🔗 흐름 설명](./docs/ts-build--guide.md)

| 스크립트 파일            | 설명                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| `fix-langs.cjs`          | UMD 스타일 `langs/*.js` → TypeScript 형식으로 `export` 구조 변환 |
| `wrap-dts.cjs`           | `typedef.d.ts`에 `global {}` 래핑 추가                           |
| `rename-index.cjs`       | `index.ts` → `index.d.ts` 이름 변경                              |
| `remove-this-params.cjs` | `prototype` 기반 constructor의 잘못된 `this` 파라미터 제거       |
