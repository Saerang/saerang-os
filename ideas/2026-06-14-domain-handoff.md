# 핸드오프 — 도메인 스킬 고도화 + Acuvue coupon 코딩레디 문서

> 2026-06-14 작성. 컨텍스트 가득 차 새 세션 인계용. 메모리(MEMORY.md)도 자동 로드됨.

## 1. 이번 작업 한 줄 요약
saerang-os의 `/domain` 스킬을 **"코드레벨 구현 지식(coding-ready)"** 산출 시스템으로 고도화하고,
실증으로 Acuvue `vine-acuvue-api`의 **coupon 도메인 문서를 코딩레디 수준(judge 92/100 통과)**까지 뽑음.

## 2. 끝난 것 (saerang-os, 전부 main 푸시됨)
- **/domain 시스템 최종화** (목표=코드레벨 coding-ready):
  - `.claude/skills/domain/SKILL.md` — 코드레벨 목표 명시, recon/bootstrap/update, 기존문서 발견, 검수 게이트(코딩레디 합격선+표정합)
  - `.claude/skills/domain/references/` — extraction-discipline(멀티소스·SQL은닉·룰북번역·확신도) / doc-template(골격·RAG·**4.5 코딩레디 루브릭**·마크다운유효성) / method-ddd(렌즈) / example
  - `.claude/agents/domain-analyst.md` — recon/bootstrap/update, 넓이먼저→깊이(룰북), 기존문서 베이스
- **make-skill 스킬 + skill-tester 에이전트**(이전 단계, main에 있음)
- **메모리 3건**: prefer-rigorous-verification / domain-logic-in-sql / discover-existing-before-generating

## 3. 끝난 것 (대상 repo: /Users/tony/Idea/Acuvue/vine-acuvue-api)
- `docs/domain/coupon/` 7파일 **코딩레디**: README·catalog·rules·model·lifecycle·campaigns·flows
  - 엔티티 필드·타입·DB컬럼 전수, enum 10종, 계산기 V1/V2 피처플래그, 예외 타입, 라이프사이클 메서드 경로, SQL 프로시저 55개·트리거·월배치(eF/3.6.9/하이퍼케어)·3+1 증정
  - 발견: 실버그 `CouponBenefitAmount.compareTo:51`, 트리거 백도어 `CONTEXT_INFO=0x99999`
- 팀 원본 `docs/domain/coupon/domain.md`(454줄) — 내용 7파일로 통합됨(중복)
- ⚠️ **현재 브랜치 main, origin 대비 ahead (미push)**. `docs/domain-coupon` 브랜치도 존재.

## 4. 바로 할 결정/정리 (운영)
- [ ] 대상 repo 도메인 문서 커밋이 **main에 올라가 있음** — 의도한 위치인지? (원래 docs/domain-coupon 브랜치 작업이었음) push/PR/브랜치 정리 결정
- [ ] `domain.md`(팀 원본) **retire** 여부 — 7파일이 대체
- [ ] origin push 여부

## 5. 다음 작업 후보
- **dx · fittingcommission 도메인**도 같은 코딩레디 루프 적용 (팀 문서가 SQL 레이어·RAG 미대응)
- coupon 잔여 갭: API 요청/응답 DTO 스키마(루브릭 9, 부분), `[확인 필요]`(L-3 회원큐레이션 클래스·markAsUsed), SQL 원본을 `docs/domain/coupon/sql/`로 동봉

## 6. 새 세션에서 재개하는 법
- **SQL 추출본은 /tmp/coupondb (휘발성) — 재부팅 시 사라짐.** 재추출:
  `cd /tmp && mkdir -p coupondb && for Z in $(find /Users/tony/Idea/Acuvue/db -path '*schema*' -name '*.zip'); do unzip -oq "$Z" -d coupondb; done`
  (쿠폰 객체: `coupondb/routine/*coupon*`·`coupondb/table/*Coupon*/trigger/*`)
- **다른 도메인 생성**: `/domain <도메인이름> /Users/tony/Idea/Acuvue/vine-acuvue-api`
  (도메인 모르면 인자 없이 `/domain /Users/tony/Idea/Acuvue/vine-acuvue-api` → recon)
- 스킬은 이미 코딩레디 기준이라, 분석가가 멀티소스(코드+SQL)·기존문서 베이스·코딩레디 루브릭을 자동 적용
- 검증: 생성 후 general-purpose 에이전트로 "이 md만으로 코딩 가능한가" 적대적 judge (이번에 92/100 받은 방식)

## 7. 핵심 원칙 (스킬에 박혀 있으나 사람도 기억)
코드레벨 깊이 / 멀티소스(특히 SQL 프로시저·트리거가 로직 은닉처) / 기존문서 베이스 확장 /
recon 정량 단정 금지 / 서술·처방 분리([제안]) / 사람 검수 게이트 / 마크다운 표 정합 / "경량" 아닌 실제 동작
