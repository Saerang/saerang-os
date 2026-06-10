---
name: push
description: 현재 브랜치를 리모트에 push한다. 업스트림이 없으면 -u로 설정. 사용자가 "푸시해줘", "push"를 요청할 때 사용.
---

# Push

현재 브랜치의 커밋을 리모트에 push하는 스킬.

## 절차

1. **상태 확인** — 다음을 병렬로 실행:
   - `git status` — 현재 브랜치와 리모트 추적 상태 확인
   - `git log @{u}..HEAD --oneline` — push될 커밋 목록 확인 (업스트림이 없어 실패하면 브랜치 전체가 새로 push되는 것이므로 `git log --oneline -10`으로 대신 확인)

2. **Push 실행**:
   - 업스트림이 설정되어 있으면: `git push`
   - 업스트림이 없으면: `git push -u origin <현재 브랜치>`

3. **결과 보고** — push된 커밋 수와 커밋 범위(예: `438bbf1..562cecd`), 브랜치를 한글로 알려준다.

## 주의사항

- push할 커밋이 없으면 "push할 커밋이 없습니다"라고 알린다
- push가 거부되면(non-fast-forward 등) 원인을 보고하고 사용자에게 처리 방법을 물어본다 — 임의로 `--force`를 쓰지 않는다
- `--force` / `--force-with-lease`는 사용자가 명시적으로 요청할 때만 사용한다
- 리모트가 없거나 detached HEAD 상태면 push하지 말고 상황을 알린 뒤 사용자에게 묻는다
