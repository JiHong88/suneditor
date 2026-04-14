### fix

- 모바일에서 툴바 클릭 시 뷰포트 변화(키보드 dismiss) 완료 후 메뉴가 표시되도록 수정 — 메뉴가 중간에 위치 이동하는 현상 해결 (`menu.js`)
- Enter 키 입력 시 포맷 라인 edge 판정이 부정확한 문제 수정 — sibling 노드 유무와 무관하게 offset 기반으로 정확히 판정 (`format.js`, `keydown.rule.enter.js`)
