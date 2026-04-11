### feat

- MS Office HTML 변환 헬퍼 추가 (`src/helper/msOffice.js`)
    - MsoListParagraph → `<ol>`/`<ul>`/`<li>` 변환 (중첩, list-style-type 감지)
    - `mso-outline-level` / `MsoHeading*` → `<h1>`~`<h6>` 변환
    - 테이블 정리: mso-yfti-_, mso-border-_, MsoTableGrid 제거, 셀 내 MsoNormal `<p>` 언랩
    - 트랙 체인지/코멘트 제거 (`<del>`, `<ins>`, MsoCommentReference, MsoCommentText)
    - `file:///` 링크/이미지 제거, 북마크 앵커 정리
    - 페이지/섹션/컬럼 브레이크 처리, Section 래퍼 언랩
    - `mso-spacerun`, `mso-tab-count` → 단일 공백 정규화
    - `mso-highlight` → `background-color` 변환
    - soft hyphen, 과도한 `&nbsp;` 제거

### fix

- balloonAlways/subBalloonAlways 모드에서 키 입력 시 툴바가 숨겨지는 문제 수정 (`handler_ww_key.js`)
- print 시 테마 클래스가 포함되어 인쇄 스타일이 깨지는 문제 수정 (`viewer.js`)
- 파일 브라우저에서 폴더 전환 시 아이템 목록과 태그가 갱신되지 않아 검색/태그 필터가 이전 데이터로 동작하는 문제 수정 (`Browser.js`)
- `layout`, `template` 드롭다운 플러그인에서 메뉴 버튼에 `data-command` 속성 누락으로 클릭/키보드 선택이 동작하지 않는 문제 수정 (`layout.js`, `template.js`)
- Firefox에서 iframe 모드가 동작하지 않는 문제 수정 — 샌드박스 iframe의 `load` 이벤트 이중 발생으로 콘텐츠가 비고 버튼이 무반응 (`editor.js`)
