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
"ts-build": "(npx tsc || true) && barrelsby --config .barrelsby.json && node scripts/ts-build/format-index.cjs && node scripts/ts-build/fix-langs.cjs && node scripts/ts-build/wrap-dts.cjs && node scripts/ts-build/rename-index.cjs && node scripts/ts-build/remove-this-params.cjs && node scripts/ts-build/gen-options-dts.cjs && node scripts/ts-build/inject-typedef-import.cjs && npm run lint:fix-ts"
```

---

## 🧩 실행 흐름 요약

1. **`tsc`**
    - JSDoc 기반으로 작성된 `.js` 파일로부터 `.d.ts` 타입 선언 파일을 생성
    - 오류가 발생해도 `|| true` 처리로 중단되지 않음

2. **`barrelsby`**
    - `types/` 폴더 내 선언 파일들을 정리된 `index.ts` (모듈 통합 진입점)로 자동 생성
    - `.barrelsby.json` 설정 파일을 기반으로 동작

3. **`format-index.cjs`**
    - `barrelsby`가 생성한 `types/index.ts`를 프로젝트 구조에 맞게 재구성
    - 모듈 re-export: `helper`, `langs`, `modules`, `plugins`
    - 공개 API 타입 export: `SunEditorOptions`, `SunEditorCore` 등 10개 타입
    - 메인 default export 추가
    - 최종적으로 공개 API 진입점 생성

4. **`fix-langs.cjs`**
    - `langs/` 폴더의 언어 파일들은 UMD 스타일 IIFE 패턴으로 작성되어 있음
    - 이들을 TypeScript에 맞는 `export` 형태로 자동 변환
    - 각 언어별 `.d.ts` 파일이 정상적으로 타입 추론되도록 수정

5. **`wrap-dts.cjs`**
    - `typedef.js`에서 생성된 `typedef.d.ts` 파일을 `declare global { namespace SunEditor {} }` 블록 안에 감쌈
    - 프로젝트 전역에서 `SunEditor` namespace를 통해 타입들을 노출함 (예: `SunEditor.Core`, `SunEditor.InitOptions`)

6. **`rename-index.cjs`**
    - `format-index.cjs`가 생성한 `index.ts` 파일을 `index.d.ts`로 이름 변경
    - 타입 선언 전용 파일로 구분

7. **`remove-this-params.cjs`**
    - **`core/`** 디렉터리는 `prototype` 기반 구조이므로 `constructor`에 `this: any` 파라미터가 잘못 생성됨
    - 이를 찾아 제거해주는 후처리 스크립트

8. **`gen-options-dts.cjs`**
    - `core/config/options.js > DEFAULTS` 객체의 실제 값들을 기반으로 `options.d.ts` 내 `export namespace DEFAULTS` 타입 정의를 덮어씀
    - 문자열, 배열, 객체 등의 값을 정확히 리터럴 타입으로 유지하여 자동으로 타입 갱신

9. **`inject-typedef-import.cjs`**
    - `types/` 폴더의 모든 `.d.ts` 파일에 `typedef.d.ts`의 전역 타입 import를 자동 주입
    - `typedef.d.ts`와 `index.d.ts`를 제외한 모든 파일에 `import type {} from './relative/path/typedef';` 추가
    - `SunEditor` namespace의 타입들을 모든 타입 파일에서 사용 가능하게 만듦 (예: `SunEditor.Core`, `SunEditor.Context`)

10. **`lint:fix-ts`**
    - 최종 `.d.ts` 파일에 대해 ESLint를 적용하여 포맷팅 및 스타일 정리 수행

---

## 📁 관련 디렉토리 구조 예시

```
types/
├── core/
│   ├── editor.d.ts
│   └── ...
├── langs/
│   ├── en.d.ts          <-- fix-langs에서 변환됨
│   └── ko.d.ts
├── plugins/
│   └── index.d.ts
├── modules/
│   └── index.d.ts
├── helper/
│   └── index.d.ts
├── typedef.d.ts         <-- wrap-dts로 SunEditor namespace 처리됨
├── suneditor.d.ts       <-- 공개 타입 정의 (10개)
└── index.d.ts           <-- format-index → rename-index로 최종 생성 (공개 API 진입점)
```

---

## 🛠 커스텀 스크립트 역할 정리

| 스크립트 파일               | 설명                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `format-index.cjs`          | `barrelsby`가 생성한 `index.ts`를 재구성, 모듈 re-export 및 공개 API 타입 10개 export                   |
| `fix-langs.cjs`             | UMD 스타일 `langs/*.js` → TypeScript 형식으로 `export` 구조 변환                                        |
| `wrap-dts.cjs`              | `typedef.d.ts`에 `declare global { namespace SunEditor {} }` 래핑 추가                                  |
| `rename-index.cjs`          | `index.ts` → `index.d.ts` 이름 변경                                                                     |
| `remove-this-params.cjs`    | `prototype` 기반 constructor의 잘못된 `this` 파라미터 제거                                              |
| `gen-options-dts.cjs`       | `DEFAULTS` 객체 기반으로 `options.d.ts` 타입 정의 자동 갱신                                             |
| `inject-typedef-import.cjs` | 모든 `.d.ts` 파일에 `typedef.d.ts`의 `SunEditor` namespace 타입 import 자동 주입 (side-effect import) |

---

## 📌 사용 시 주의사항

- `typedef.js`는 반드시 JSDoc 기반으로 정확하게 작성되어야 합니다.
- `suneditor.js`의 타입 정의(`@typedef`)는 `format-index.cjs`를 통해 자동으로 `types/index.d.ts`에 export됩니다.
    - 공개 API 타입을 추가하려면 `suneditor.js`에 `@typedef` 추가 후 `format-index.cjs`의 export 목록도 업데이트해야 합니다.
- `langs/*.js`는 반드시 IIFE 패턴을 따라야 하며, 내부 `const lang = {...}` 구조를 가져야 정상 변환됩니다.
- `core/` 디렉터리는 `prototype` 기반으로 동작하며, TypeScript 변환 후 후처리가 필요합니다.
- 이 스크립트는 `.d.ts` 타입 정의만 생성하므로 실제 코드 번들에는 영향을 주지 않습니다.
