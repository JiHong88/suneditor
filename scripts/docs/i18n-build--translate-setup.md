⭐️ `npm run i18n-build`

---

# 🌐 Google Cloud Translation API 설정 가이드

이 문서는 `i18n-sync.cjs` 자동 번역 스크립트를 실행하기 위한 **Google Cloud Translation API** 사용 설정 과정을 정리한 가이드입니다.

---

## 📌 사전 설정

-   Google Cloud Platform (GCP) 계정
-   프로젝트 생성 또는 기존 프로젝트 사용
-   Node.js 개발 환경
-   `@google-cloud/translate` 패키지 설치되어 있음

---

## ✅ 1. Google Cloud 프로젝트 준비

1. [Google Cloud Console](https://console.cloud.google.com/) 에 로그인
2. 우측 상단에서 프로젝트을 선택 또는 새 프로젝트 생성
3. 왼측 메뉴에서 `API 및 서비스 → 라이브러리`로 이동
4. `Cloud Translation API` 검색 해서 선택
5. **[사용]** 버튼 누르며 활성화

---

## ✅ 2. 서비스 계정 생성 및 키 발급

1. 왼측 메뉴에서 `IAM 및 관리자 → 서비스 계정`으로 이동
2. **[ 서비스 계정 만들기 ]** 클릭
    - 서비스 계정 이름 예시: `translation-sync`
3. 권한은 생방하고 **[완료]** 버튼 클릭
4. 생성된 서비스 계정을 클릭 하고 상단의 **[키]** 탭으로 이동
5. **[키 추가 → 새 키 만들기]**
    - 키 형식: `JSON`
    - 키가 자동 다운로드됩니다.
6. 파일 이름을 `google-api-service-account.json`으로 변경하고 프로젝트 루트의 `.env/` 폴더를 만들어 폴더안에 저장
    > `.env/google-api-service-account.json`

---

## ✅ 3. 역할 부여

1. 왼측 메뉴 `IAM → 전체 권한 보기`로 이동
2. 서비스 계정 이메일(예: `translation-sync@project-id.iam.gserviceaccount.com`) 입력
3. **[+ 역할 추가]** 클릭
4. `Cloud Translation API 사용자`를 검색하거나 `roles/cloudtranslate.user`를 입력 해서 선택
5. 저장

---

## ✅ 4. 환경변수 등록

package.json > scripts > i18n-build 에서 환경 변수를 설정 하고 있습니다.

```json
"scripts": {
  "i18n-build": "cross-env GOOGLE_APPLICATION_CREDENTIALS=./.env/google-api-service-account.json node scripts/i18n-sync.cjs --auto-translate && npx eslint \"src/langs/*.js\" --fix && npx eslint \"types/langs/_Lang.d.ts\" --fix"
}
```

---

## ✅ 5. .gitignore

보안을 위해 서비스 계정 키가 Git에 포함되지 않도록 `.gitignore`, `.npmignore` 등의 파일을 수정하지 마십시오.

```
.env/
```

---

## ✅ 6. 실행

```bash
npm run i18n-build
```

이 명령은 다음을 수행합니다:

-   `en.js`를 기준으로 모든 언어 파일에 누락된 키를 자동 번역 후 각 언어 파일에 추가
-   타입 선언 파일(`_Lang.d.ts`) 업데이트
-   ESLint 자동 수정 실행

> 👀 !"node run ts-build" 는 실행하지 않습니다. (types 파일 업데이트)

---

## ✅ 참고

-   [Cloud Translation API 공식 문서](https://cloud.google.com/translate/docs)
-   [@google-cloud/translate npm 패키지](https://www.npmjs.com/package/@google-cloud/translate)

---

## 🧐 FAQ

**Q. `PERMISSION_DENIED` 에러가 발생합니다.**  
→ 서비스 계정에 `Cloud Translation API 사용자` 역할이 부여되어 있는지 확인해주세요.

**Q. 역할 추가 할 때 목록에 보이지 않습니다.**  
→ Translation API가 활성화되지 않았거나, 결함 정도 후에 IAM 목록에 나타나는 경우가 있습니다. 이 경우, 아래 명령으로 CLI로 추가할 수 있습니다:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/cloudtranslate.user"
```

---

## ✅ 결과 예시

```bash
[↻] Translating (en → ko) welcome: Welcome!
[✓] Translated (ko:welcome) → 환영합니다!
[✔] Updated ko
[✔] Updated _Lang.d.ts
```
