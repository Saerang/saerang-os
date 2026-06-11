# 스킬 작성 베스트 프랙티스 (Anthropic 공식 압축본)

> 출처: Claude Docs "Skill authoring best practices" + anthropics/skills `skill-creator`.
> make-skill이 초안 작성·자가 점검 시 기준으로 삼는 참조 문서. 필요한 절만 읽어라.

## 목차
- 1. frontmatter 규칙 (필수)
- 2. naming 규칙
- 3. description 작성법 (트리거의 전부)
- 4. Concise is key
- 5. Progressive disclosure (구조)
- 6. 자유도(degrees of freedom) 맞추기
- 7. 워크플로·피드백 루프 패턴
- 8. 템플릿·예시 패턴
- 9. 스크립트 작성 가이드
- 10. 안티패턴
- 11. 출하 전 체크리스트

---

## 1. frontmatter 규칙 (필수)

SKILL.md는 YAML frontmatter로 시작하며 **필수 2필드**:

- `name`
  - 최대 **64자**
  - **소문자·숫자·하이픈만** (공백·대문자·언더스코어 불가)
  - XML 태그 불가
  - 예약어 불가: **`anthropic`, `claude`**
- `description`
  - 비어있으면 안 됨, 최대 **1024자**
  - XML 태그 불가
  - **무엇을 하는지 + 언제 쓰는지**를 둘 다 담는다

이 OS 추가 관례: `argument-hint`(인자 형태 힌트)를 함께 둔다.

## 2. naming 규칙

- 권장: **gerund(동사+-ing)** — `processing-pdfs`, `analyzing-spreadsheets`
- 허용: 명사구(`pdf-processing`), 액션형(`process-pdfs`)
- 이 OS의 기존 스킬은 짧은 동사/명사형(commit, push, develop, domain)을 쓰므로 그 결을 따라도 됨
- **금지**: vague 이름(`helper`, `utils`, `tools`), 과도하게 일반적(`documents`, `data`), 예약어 포함

## 3. description 작성법 (트리거의 전부)

Claude는 100개+ 스킬 중 **description만 보고** 발동 여부를 고른다. 본문은 발동 후에야 읽힌다.

- **반드시 3인칭** — "Processes Excel files..." (O) / "I can help you..."(X) / "You can use..."(X)
  - 시점 불일치는 발동 문제를 일으킨다
- **무엇 + 언제 + 트리거 키워드**를 구체적으로:
  - 좋음: `PDF 파일에서 텍스트·표를 추출하고 양식을 채운다. PDF·양식·문서 추출을 다룰 때 사용.`
  - 나쁨: `문서를 도와줍니다` / `데이터를 처리합니다`
- 사용자가 **실제로 칠 말**을 트리거로 넣는다 (이 OS는 한글 트리거)
- 주의: Claude는 **혼자 쉽게 처리되는 1스텝 작업**(예: "이 PDF 읽어줘")에는 description이 맞아도
  스킬을 발동 안 할 수 있다. 스킬은 "혼자선 번거로운 작업"을 노린다

## 4. Concise is key

컨텍스트 윈도우는 공유 자원. **Claude는 이미 똑똑하다고 가정**하고, 모르는 것만 넣어라.

- 매 문단에 물어라: "Claude가 이걸 정말 모르나? 이 토큰이 값을 하나?"
- PDF가 뭔지, 라이브러리 쓰는 법 같은 일반 상식은 설명하지 마라
- 단, Haiku까지 쓸 거면 더 많은 가이드가 필요할 수 있다 — 쓸 모델로 테스트

## 5. Progressive disclosure (구조)

3단계 로딩:
- **메타데이터**(name+description): 항상 로드 (~100단어)
- **SKILL.md 본문**: 발동 시 로드 — **500줄 이하 유지**
- **번들 리소스**: 필요할 때만 로드 (무제한, 토큰 0 until 읽힘)
  - `scripts/` 실행 코드 / `references/` 참조 문서 / `assets/` 출력에 쓰는 파일(템플릿·아이콘)

규칙:
- 본문이 500줄에 가까워지면 분할
- **참조는 SKILL.md에서 한 단계 깊이만** — 중첩 참조(A→B→C) 금지.
  Claude가 중첩 파일은 `head`로 일부만 읽어 정보가 불완전해진다
- 참조 파일이 **100줄 넘으면 맨 위에 목차(ToC)** 를 둔다
- 파일명은 내용을 드러내게 (`form_validation_rules.md`, not `doc2.md`)

패턴:
1. **고수준 가이드 + 참조**: 본문은 quick start, 상세는 `FORMS.md`/`REFERENCE.md`로
2. **도메인별 분리**: `reference/finance.md`, `reference/sales.md` — 관련 도메인만 로드
3. **조건부 상세**: 기본 내용 보이고 고급은 링크로

## 6. 자유도(degrees of freedom) 맞추기

작업의 깨지기 쉬움·가변성에 맞춰 구체성을 조절:
- **고자유도(텍스트 가이드)**: 정답이 여럿·맥락 의존·휴리스틱. 예) 코드 리뷰 절차
- **중자유도(파라미터 있는 의사코드/스크립트)**: 선호 패턴 있고 변형 허용
- **저자유도(고정 스크립트)**: 깨지기 쉬움·일관성 필수·정해진 순서. 예) DB 마이그레이션
- 비유: 절벽 사이 좁은 다리 → 정확한 가드레일 / 평지 → 방향만 주고 신뢰
- **"왜"를 설명하라** — 오늘날 LLM은 근거를 주면 기계적 지시를 넘어선다
- ALL CAPS MUST/NEVER 남용 금지 (정말 중요한 곳만)

## 7. 워크플로·피드백 루프 패턴

- 복잡한 작업은 **명확한 순차 단계**로. 아주 복잡하면 Claude가 응답에 복사해 체크할
  **체크리스트**(`- [ ] Step 1 ...`)를 제공
- **피드백 루프**: 검증 → 오류 수정 → 반복. 품질을 크게 올린다
  - 코드 없는 스킬: STYLE_GUIDE.md 대비 점검 루프
  - 코드 스킬: validate.py 통과할 때까지 수정 루프
- **plan-validate-execute**: 위험·대량 작업은 계획 파일 생성 → 스크립트로 검증 → 실행 → 확인

## 8. 템플릿·예시 패턴

- **출력 형식이 중요하면 템플릿 제공** (엄격하면 "ALWAYS use this exact template", 유연하면 "sensible default")
- **출력 품질이 예시 의존이면 input/output 쌍을 직접 보여줘라** (커밋 메시지 등)
- 예시는 추상이 아니라 **구체적으로**

## 9. 스크립트 작성 가이드 (코드 번들 시)

- **Solve, don't punt** — 에러를 Claude에 떠넘기지 말고 스크립트가 직접 처리(FileNotFound 등)
- **voodoo 상수 금지** — 모든 값에 근거 주석 (`TIMEOUT = 30  # 느린 연결 대비`). 값 못 정하면 Claude도 못 정함
- **유틸 스크립트 선호** — 생성 코드보다 신뢰성·토큰·일관성 우수
- **실행 vs 참조 의도 명시**: "Run `analyze.py`"(실행) / "See `analyze.py` for the algorithm"(참조)
- **의존성 명시** — 설치 가정 금지(`pip install pypdf` 적기). API 환경은 네트워크·런타임 설치 없음 주의
- MCP 도구는 **풀네임**(`ServerName:tool_name`)으로

## 10. 안티패턴

- ✗ Windows 경로(`scripts\helper.py`) — 항상 forward slash
- ✗ 선택지 과다("pypdf냐 pdfplumber냐 PyMuPDF냐...") — 디폴트 하나 + escape hatch
- ✗ 시간민감 정보("2025년 8월 전엔...") — "old patterns" 섹션(`<details>`)으로 격리
- ✗ 용어 혼용 — 하나 골라 일관되게(API endpoint / field / extract)
- ✗ 설명 과잉 — Claude가 아는 것 재설명

## 11. 출하 전 체크리스트

핵심 품질
- [ ] description이 구체적이고 트리거 키워드 포함
- [ ] description에 "무엇 + 언제"가 다 있음 (3인칭)
- [ ] SKILL.md 본문 500줄 이하
- [ ] 상세는 별도 파일로 (필요 시), 참조 1단계
- [ ] 시간민감 정보 없음 (있으면 old patterns)
- [ ] 용어 일관, 예시 구체적
- [ ] progressive disclosure 적절, 워크플로 단계 명확

코드·스크립트 (있을 때)
- [ ] 스크립트가 punt 안 하고 에러 처리, voodoo 상수 없음
- [ ] 의존성 명시·확인, forward slash, 중요 작업에 검증/피드백 루프

테스트
- [ ] 대표 태스크로 **실제 실행 검증** 통과 (트리거 정확도 + 기대 동작)
- [ ] 쓸 모델(Haiku/Sonnet/Opus)에서 동작 확인
