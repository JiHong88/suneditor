---
name: commit
description: 커밋 메시지를 자동 생성하고 커밋한다. 커밋 요청 시 반드시 이 스킬을 참조한다.
---

# 에이전트 커밋

커밋 요청 시 아래 절차를 **반드시** 따른다.

## 절차

1. `git status`로 변경 파일 확인
2. `git add`로 관련 파일 스테이징
3. `git diff --staged` 분석 → 아래 포맷/규칙에 따라 커밋 메시지 생성

## 커밋 메시지 포맷

```
<타입>(<스코프>): <한줄 요약>

- <변경내역 1>
- <변경내역 2>
- ...
```

- 변경이 단순하면 본문(불릿) 생략하고 제목만 사용한다.
- 본문 불릿은 **3~6개** 정도가 적당. 그 이상이면 그룹화 부족 신호.

## 타입

| 타입       | 용도                                 | 예시                                     |
| ---------- | ------------------------------------ | ---------------------------------------- |
| `feat`     | 새로운 기능 추가                     | `feat: 이미지 편집 도구 추가`            |
| `fix`      | 버그 수정                            | `fix: 붙여넣기 시 테이블 병합 문제 해결` |
| `refactor` | 코드 리팩토링 (기능 변화 없음)       | `refactor: toolbar 렌더링 로직 개선`     |
| `perf`     | 성능 최적화                          | `perf: 커서 위치 복원 속도 개선`         |
| `docs`     | 문서 수정 (README, 주석 등)          | `docs: README 사용법 예시 추가`          |
| `style`    | 코드 스타일 수정 (포맷, 세미콜론 등) | `style: 들여쓰기 및 공백 정리`           |
| `test`     | 테스트 코드 추가/수정                | `test: 병합 케이스 유닛 테스트 추가`     |
| `chore`    | 빌드 설정, 패키지 관리, 기타 작업    | `chore: webpack 설정 정리`               |
| `ci`       | CI/CD 설정 관련 변경                 | `ci: GitHub Actions 배포 설정 추가`      |
| `design`   | 디자인 관련 UIUX 변경                | `버튼 전체 radius값 수정`                |
| `build`    | 빌드 시스템 변경                     | `build: babel 최신 버전으로 업데이트`    |

## 규칙

- 스코프: 생략 가능
- 한줄 요약: 50자 이내, 영문으로 작성
- 변경내역 작성 규칙:
    - 같은 성격의 변경은 **하나의 불릿으로 묶어서** 서술한다.
      (예: 여러 파일/함수의 동일한 리네이밍 → "rename X to Y across handlers")
    - 파일·함수 단위가 아니라 **의도(intent) 단위**로 작성한다.
        - ❌ "edit a.js, edit b.js, edit c.js"
        - ✅ "apply new offset logic to drag handlers"
    - 사소한 변경(주석, 포맷, import 정리 등)은 묶거나 생략한다.
    - CSS/디자인 토큰, 테스트 업데이트처럼 부수적인 변경은 한 줄로 합친다.

## 변경내역 예시

❌ 너무 잘게 쪼갠 경우

- update offset.js getOffset
- update offset.js getScroll
- update blockHandle.js position calc
- update blockHandle.js drag init
- update handler_ww_dragDrop.js drop handler
- update ui.js positioning

✅ 의도 단위로 묶은 경우

- refactor offset/positioning utilities for block handle drag
- align drag-drop and UI shell with new offset API
