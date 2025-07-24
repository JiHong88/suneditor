⭐️ `npm run ts-build`

---

# 📦 ts-build 스크립트 가이드

이 문서는 `npm run ts-build` 명령어로 실행되는 TypeScript 선언 파일 생성 자동화 파이프라인을 설명합니다.

이 빌드 과정은 **JSDoc + JavaScript 기반의 코드로부터 `.d.ts` 파일을 생성**하고, 추가적으로 구조 보정 및 포맷 정리를 수행합니다.

---

## 🚀 실행 명령어

```bash
npm run ts-build
```

```json
"ts-build": "(npx tsc || true) && barrelsby --delete --directory types --exclude \"typedef.d.ts\" && node scripts/fix-langs.cjs && node scripts/wrap-dts.cjs && node scripts/rename-index.cjs && node scripts/remove-this-params.cjs && node scripts/gen-options-dts.cjs && npm run lint:fix-ts"
```

---

## 🧩 실행 흐름 요약

1. **`tsc`**

    - JSDoc 기반으로 작성된 `.js` 파일로부터 `.d.ts` 타입 선언 파일을 생성
    - 오류가 발생해도 `|| true` 처리로 중단되지 않음

2. **`barrelsby`**

    - `types/` 폴더 내 선언 파일들을 정리된 `index.ts` (모듈 통합 진입점)로 묶음
    - `typedef.d.ts`는 제외 처리

3. **`fix-langs.cjs`**

    - `langs/` 폴더의 언어 파일들은 UMD 스타일 IIFE 패턴으로 작성되어 있음
    - 이들을 TypeScript에 맞는 `export` 형태로 자동 변환
    - 각 언어별 `.d.ts` 파일이 정상적으로 타입 추론되도록 수정

4. **`wrap-dts.cjs`**

    - `typedef.js`에서 생성된 `typedef.d.ts` 파일을 `global {}` 블록 안에 감쌈
    - 프로젝트 전역에서 `__se__`로 시작하는 타입들을 글로벌 타입으로 노출함

5. **`rename-index.cjs`**

    - `barrelsby`가 생성한 `index.ts` 파일을 `index.d.ts`로 이름 변경
    - 타입 선언 전용 파일로 구분

6. **`remove-this-params.cjs`**

    - **`core/`** 디렉터리는 `prototype` 기반 구조이므로 `constructor`에 `this: any` 파라미터가 잘못 생성됨
    - 이를 찾아 제거해주는 후처리 스크립트

7. **`gen-options-dts.cjs`**

    - `core/config/options.js > DEFAULTS` 객체의 실제 값들을 기반으로 `options.d.ts` 내 `export namespace DEFAULTS` 타입 정의를 덮어씀
    - 문자열, 배열, 객체 등의 값을 정확히 리터럴 타입으로 유지하여 자동으로 타입 갱신

8. **`lint:fix-ts`**
    - 최종 `.d.ts` 파일에 대해 ESLint를 적용하여 포맷팅 및 스타일 정리 수행

---

## 📁 관련 디렉토리 구조 예시

```
types/
├── core/
│   ├── editor.d.ts
│   ├── ...
│   └── index.d.ts      <-- rename-index에서 최종 생성
├── langs/
│   ├── en.d.ts         <-- fix-langs에서 변환됨
│   └── ko.d.ts
├── typedef.d.ts        <-- wrap-dts로 global {} 처리됨
└── ...
```

---

## 🛠 커스텀 스크립트 역할 정리

| 스크립트 파일            | 설명                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| `fix-langs.cjs`          | UMD 스타일 `langs/*.js` → TypeScript 형식으로 `export` 구조 변환 |
| `wrap-dts.cjs`           | `typedef.d.ts`에 `global {}` 래핑 추가                           |
| `rename-index.cjs`       | `index.ts` → `index.d.ts` 이름 변경                              |
| `remove-this-params.cjs` | `prototype` 기반 constructor의 잘못된 `this` 파라미터 제거       |
| `gen-options-dts.cjs`    | `DEFAULTS` 객체 기반으로 `options.d.ts` 타입 정의 자동 갱신      |

---

## 📌 사용 시 주의사항

-   `typedef.js`는 반드시 JSDoc 기반으로 정확하게 작성되어야 합니다.
-   `langs/*.js`는 반드시 IIFE 패턴을 따라야 하며, 내부 `const lang = {...}` 구조를 가져야 정상 변환됩니다.
-   `core/` 디렉터리는 `prototype` 기반으로 동작하며, TypeScript 변환 후 후처리가 필요합니다.
-   이 스크립트는 `.d.ts` 타입 정의만 생성하므로 실제 코드 번들에는 영향을 주지 않습니다.
