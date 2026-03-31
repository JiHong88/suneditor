# 🛠 Scripts Guide

SunEditor의 빌드 및 검증 자동화 스크립트 가이드입니다.

---

## 📂 폴더 구조

```
scripts/
├── check/              # 코드 검증 및 동기화 스크립트
│   ├── check-exports-sync.cjs
│   ├── inject-plugin-jsdoc.cjs
│   └── langs-sync.cjs
├── ts-build/           # TypeScript 타입 정의 빌드 스크립트
│   ├── fix-langs.cjs
│   ├── format-index.cjs
│   ├── gen-options-dts.cjs
│   ├── gen-types-export.cjs
│   ├── inject-typedef-import.cjs
│   ├── rename-index.cjs
│   └── wrap-dts.cjs
└── docs/               # 스크립트 사용 가이드 문서
    ├── check-langs--translate-setup.md
    └── ts-build--guide.md
```

---

## 🔍 check/ - 코드 검증 스크립트

### check-exports-sync.cjs

3개의 내보내기 파일 동기화를 검증하는 스크립트입니다.

**실행**: `npm run check:exports`

**기능**:

- `src/suneditor.js`를 기준(source of truth)으로 `webpack/cdn-builder.js`, `scripts/ts-build/format-index.cjs`의 export 동기화 검증
- 누락된 export 또는 불필요한 extra export 탐지
- `cdn-builder.js`에서 `langs` 제외는 의도적 (CDN 크기 최적화)

**사용 시점**:

- 새 모듈 export 추가/제거 시
- `suneditor.js`, `cdn-builder.js`, `format-index.cjs` 중 하나를 수정한 후
- `npm run check` 실행 시 자동으로 포함됨

---

### inject-plugin-jsdoc.cjs

플러그인 옵션 타입을 `options.js`에 자동으로 주입하는 스크립트입니다.

**실행**: `npm run check:inject`

**기능**:

- `src/plugins/**/*.js`에서 모든 플러그인 옵션 타입(`*PluginOptions`) 자동 스캔
- `src/core/config/options.js`의 `EditorBaseOptions` typedef에 플러그인 옵션 JSDoc 주석 자동 주입
- 28개 플러그인의 옵션 타입을 자동으로 유지 관리

**사용 시점**:

- 새 플러그인 추가 시
- 플러그인 옵션 타입 변경 시
- `npm run check` 실행 시 자동으로 포함됨

---

### langs-sync.cjs

언어 파일 자동 번역 및 동기화 스크립트입니다.

**실행**: `npm run check:langs`

**기능**:

- `src/langs/en.js`를 기준으로 모든 언어 파일(`ko.js`, `ja.js` 등)의 누락된 키 탐지
- Google Cloud Translation API를 통한 자동 번역
- `types/langs/_Lang.d.ts` 타입 정의 자동 업데이트
- ESLint 자동 포맷팅

**요구사항**:

- Google Cloud Translation API 설정 필요
- 환경 변수: `GOOGLE_APPLICATION_CREDENTIALS=./.env/google-api-service-account.json`

**상세 가이드**: [📖 check-langs--translate-setup.md](../scripts/docs/check-langs--translate-setup.md)

---

## 🏗 ts-build/ - TypeScript 타입 빌드 스크립트

TypeScript 선언 파일(`.d.ts`) 생성 및 후처리 파이프라인입니다.

**실행**: `npm run ts-build`

**전체 파이프라인**:

```bash
npx tsc                                    # JSDoc → .d.ts 생성
→ barrelsby                                # index.ts 진입점 생성
→ format-index.cjs                         # index.ts 재구성
→ fix-langs.cjs                            # 언어 파일 타입 정의
→ wrap-dts.cjs                             # typedef.d.ts 전역 래핑
→ rename-index.cjs                         # index.ts → index.d.ts
→ gen-options-dts.cjs                      # DEFAULTS 타입 생성
→ inject-typedef-import.cjs                # typedef import 주입
→ gen-types-export.cjs                     # types.d.ts 생성
→ npm run lint:fix-ts                      # ESLint 포맷팅
```

**상세 가이드**: [📖 ts-build--guide.md](../scripts/docs/ts-build--guide.md)

---

### 각 스크립트 설명

#### format-index.cjs

`barrelsby`가 생성한 `types/index.ts`를 공개 API 구조로 재구성합니다.

**기능**:

- 모듈 re-export: `helper`, `langs`, `modules`, `plugins`
- 공개 API 타입 10개 export
- 메인 default export 추가

---

#### fix-langs.cjs

언어 파일의 타입 정의를 자동으로 생성 및 관리합니다.

**기능**:

- `src/langs/en.js`에서 키 추출
- `types/langs/_Lang.d.ts` 자동 생성/업데이트
- 모든 언어 파일(`ko.d.ts`, `ja.d.ts` 등)에 `_Lang` 타입 import 추가

**예시**:

```typescript
// types/langs/_Lang.d.ts (자동 생성)
export type _Lang = {
    code: string;
    toolbar: { ... };
    // ...
};

// types/langs/ko.d.ts (자동 생성)
import { _Lang } from './_Lang';
declare const ko: _Lang;
export default ko;
```

---

#### wrap-dts.cjs

`typedef.d.ts`를 전역 네임스페이스로 래핑하고 export를 추가합니다.

**기능**:

- `typedef.d.ts`를 `declare global { namespace SunEditor {} }` 블록으로 감싸기
- `export type { SunEditor };` 추가로 모듈 import 가능하게 만들기

**결과**:

```typescript
// 전역 사용 가능
const options: SunEditor.InitOptions = { ... };

// 모듈 import로도 사용 가능
import type { SunEditor } from 'suneditor/types';
const options: SunEditor.InitOptions = { ... };
```

---

#### rename-index.cjs

`format-index.cjs`가 생성한 `types/index.ts`를 `index.d.ts`로 변경합니다.

**이유**: 타입 선언 전용 파일로 명확히 구분

````

---

#### gen-options-dts.cjs

`DEFAULTS` 객체의 실제 값을 기반으로 타입 정의를 자동 갱신합니다.

**대상**: `types/core/config/options.d.ts`

**기능**:

- `src/core/config/options.js`의 `DEFAULTS` 객체 파싱
- 실제 값을 리터럴 타입으로 변환
- `export namespace DEFAULTS` 블록 자동 생성

**예시**:

```javascript
// src/core/config/options.js
export const DEFAULTS = {
    BUTTON_LIST: [['undo', 'redo'], ...],
    SIZE_UNITS: ['px', 'pt', 'em', 'rem']
};

// types/core/config/options.d.ts (자동 생성)
export namespace DEFAULTS {
    const BUTTON_LIST: [['undo', 'redo'], ...];
    const SIZE_UNITS: ['px', 'pt', 'em', 'rem'];
}
````

---

#### inject-typedef-import.cjs

모든 `.d.ts` 파일에 `typedef.d.ts`의 전역 타입 import를 자동 주입합니다.

**기능**:

- `types/**/*.d.ts` (typedef.d.ts, index.d.ts 제외) 스캔
- 각 파일에 상대 경로로 `import type {} from './relative/path/typedef';` 추가
- Side-effect import로 전역 `SunEditor` namespace 활성화

**이유**: 모든 타입 파일에서 `SunEditor.*` 타입 사용 가능하게 만들기

---

#### gen-types-export.cjs

`types.d.ts` 타입 재내보내기 파일을 생성합니다.

**기능**:

- `typedef.d.ts`의 `SunEditor` namespace에서 타입 추출
- 개별 타입으로 re-export

**결과**:

```typescript
// types/types.d.ts
export type InitOptions = SunEditor.InitOptions;
export type Context = SunEditor.Context;
export type Core = SunEditor.Core;
// ...
```

**사용 예시**:

```typescript
// 네임스페이스 없이 타입 import
import type { InitOptions, Context } from 'suneditor/types/types';
```

---

## 📖 docs/ - 상세 가이드 문서

### check-langs--translate-setup.md

Google Cloud Translation API 설정 및 사용 가이드입니다.

**내용**:

- GCP 프로젝트 설정
- Translation API 활성화
- 서비스 계정 생성 및 키 발급
- 환경 변수 설정
- 실행 방법 및 FAQ

[📖 전체 가이드 보기](../scripts/docs/check-langs--translate-setup.md)

---

### ts-build--guide.md

TypeScript 빌드 파이프라인 전체 흐름 상세 설명입니다.

**내용**:

- 전체 빌드 파이프라인 흐름도
- 각 스크립트의 역할 상세 설명
- 생성되는 파일 구조
- 커스텀 스크립트 역할 정리
- 사용 시 주의사항

[📖 전체 가이드 보기](../scripts/docs/ts-build--guide.md)

---

## 🚀 주요 명령어

### 개발 시 사용

```bash
npm run ts-build        # TypeScript 타입 정의 빌드
npm run check:inject    # 플러그인 옵션 타입 주입
npm run check:exports   # 3대 내보내기 파일 동기화 검증
npm run check:langs     # 언어 파일 동기화 (Google API 필요)
npm run check           # check:arch + check:exports + check:inject + check:langs 실행
```

### 타입 검증

```bash
npm run lint:type       # TypeScript 타입 체크
npm run lint:fix-ts     # TypeScript 파일 ESLint 자동 수정
```

### 아키텍처 검증

```bash
npm run check:arch      # 의존성 규칙 검증 (dependency-cruiser)
```

---

## 🔄 스크립트 실행 순서 (권장)

1. **새 플러그인 추가 시**:

    ```bash
    npm run check:inject    # 플러그인 옵션 타입 주입
    npm run ts-build        # 타입 정의 재생성
    ```

2. **JSDoc 수정 시**:

    ```bash
    npm run ts-build        # 타입 정의 재생성
    npm run lint:type       # 타입 에러 확인
    ```

3. **언어 파일 키 추가 시**:

    ```bash
    npm run check:langs     # 자동 번역 및 동기화
    npm run ts-build        # _Lang.d.ts 업데이트
    ```

4. **전체 검증**:
    ```bash
    npm run check           # inject + arch 검증
    npm run ts-build        # 타입 빌드
    npm run lint            # 전체 lint + 타입 체크
    ```

---

## 📝 참고

### 관련 도구

- **TypeScript**: JSDoc → `.d.ts` 변환
- **barrelsby**: 모듈 진입점(`index.ts`) 자동 생성
- **ESLint**: 코드 포맷팅 및 스타일 검사
- **dependency-cruiser**: 아키텍처 규칙 검증
- **Google Cloud Translation API**: 자동 번역

### 외부 문서

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [GitHub Autolinked References](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Google Cloud Translation API](https://cloud.google.com/translate/docs)

---

## ⚠️ 주의사항

### 수동 편집 금지 파일

다음 파일들은 스크립트로 자동 생성되므로 **직접 수정하지 마세요**:

- `types/**/*.d.ts` (전체)
- `types/types.d.ts`
- `src/core/config/options.js` (플러그인 옵션 섹션)

### 스크립트 수정 시

- 경로 변경: 모든 `__dirname` 기반 상대 경로 확인
- package.json 명령어 업데이트
- 관련 문서 동시 업데이트
- 테스트 실행으로 검증

---

## 🐛 문제 해결

### 타입 에러 발생 시

```bash
# 타입 파일 전체 재생성
npm run ts-build

# 타입 에러 확인
npm run lint:type
```

### 플러그인 옵션 타입 누락 시

```bash
# 플러그인 옵션 재주입
npm run check:inject

# 타입 재생성
npm run ts-build
```

### 언어 파일 동기화 실패 시

1. Google Cloud API 키 확인: `.env/google-api-service-account.json`
2. 환경 변수 확인: `GOOGLE_APPLICATION_CREDENTIALS`
3. Translation API 활성화 확인
4. 서비스 계정 권한 확인

[📖 상세 가이드](../scripts/docs/check-langs--translate-setup.md)

---

## 📚 추가 가이드

- [GUIDE.md](../GUIDE.md) - 전체 개발 가이드
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 기여 가이드
- [commit-types.md](./commit-types.md) - 커밋 메시지 타입
