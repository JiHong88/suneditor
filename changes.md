### feat

- Block handle 기능 추가 — 라인 사이드 핸들에서 hover/drag/액션 메뉴 제공
- SelectMenu 호버 기반 서브메뉴 지원

### change

- Dropdown 플러그인 메뉴 생성 방식을 공통 메서드 기반으로 통일
- 디자인 radius 값 조정
- wysiwyg `mousemove` 핸들러를 `requestAnimationFrame` 기반으로 코얼레스
- SelectMenu 항목 hover/active 색상을 푸른 톤으로 변경
- SelectMenu submenu 화살표 opacity 조정

### fix

- SelectMenu: `left`/`right` 모드에서 좌우 flip이 좌표계 혼합으로 동작하지 않던 문제
- `list-style-position: inside`로 변경 — 글머리기호가 바깥으로 넘치지 않도록
