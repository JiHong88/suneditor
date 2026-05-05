### change

- Dropdown 플러그인 메뉴 생성 방식을 공통 메서드 기반으로 통일 (`menu.js`, 모든 `src/plugins/dropdown/*.js`)
    - 기존: 각 플러그인이 `CreateHTML()` 내부에서 `<div class="se-dropdown se-list-layer">…<ul><li><button>…</button></li></ul></div>` 전체 마크업을 직접 문자열로 조립해 `Menu.initDropdownTarget(class, menuElement)`에 전달
    - 변경: 각 플러그인은 `CreateItems()`에서 표준 아이템 객체 배열만 반환 — `{ command, value?, title, innerHTML, className?, attrs? }`. `Menu.initDropdownTarget(class, items, { className?, prependHTML? })`이 내부 `CreateDropdownMenu()`로 DOM을 생성하고, 렌더된 `<button>` 요소를 각 item의 `_element`에 자동 매핑
    - `Menu.itemsMap[pluginKey]`로 구조화된 아이템 배열을 외부에 노출 — Block handle 액션 메뉴가 dropdown 플러그인의 아이템을 서브메뉴로 재사용하기 위한 연결고리
    - 적용 플러그인: `align`, `blockStyle`, `font`, `hr`, `layout`, `lineHeight`, `list`, `paragraphStyle`, `template`, `textStyle`
    - 호환성: 기존처럼 완성된 HTMLElement를 두 번째 인자로 넘기는 호출도 그대로 지원 (배열/Node 양쪽 분기). 커스텀 플러그인은 마이그레이션 없이 동작하지만, `itemsMap` 노출이 필요한 경우 신규 시그니처로 전환 권장
- 디자인 radius 값 조정

### fix

- SelectMenu: `left`/`right`로 여는 모드의 좌우 flip 및 `subPosition` 가로 정렬에서 viewport 잔여공간 계산이 좌표계 혼합으로 어긋나 공간이 부족해도 flip이 안 되던 문제 — 문서 좌표(`getGlobal().left`) + 프레임-상대 `globalTarget.left` 혼용을 viewport 좌표(`getGlobal().fixedLeft`)로 통일 (`SelectMenu.js`)
- `list-style-position: inside`로 변경 — 글머리기호가 바깥으로 넘치지 않도록 (`suneditor-contents.css`)
