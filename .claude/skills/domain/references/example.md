# 워크드 예제 — 코드에서 도메인 문서까지

> 분석가가 재현할 **완성 형식의 본보기** 한 벌. 추상 템플릿보다 이 예시가 "이쁘게 일관되게"를
> 만든다. (가상의 작은 `order` 도메인 / Spring-JPA / DDD 렌즈)

## 목차
- 0. 입력 코드 (발췌)
- 1. 정찰 메모 (recon)
- 2. 완성 문서 (README.md)
- 3. 이 예시가 보여주는 것

## 0. 입력 코드 (발췌)

```java
// order/domain/Order.java
@Entity
public class Order {
    @Id Long id;
    @Enumerated(EnumType.STRING) OrderStatus status;   // CREATED, PAID, SHIPPED, CANCELLED
    @Version long version;                              // 낙관락
    Long customerId;                                    // 다른 애그리거트는 ID 참조
    @OneToMany(cascade = ALL) List<OrderLine> lines;    // 애그리거트 내부

    void cancel() {
        if (status == SHIPPED) throw new IllegalStateException("배송 후 취소 불가");
        this.status = CANCELLED;
    }
}
// order/app/OrderService.java
@Transactional
public Order place(PlaceOrderCmd cmd) {
    if (cmd.lines().isEmpty()) throw new EmptyOrderException();   // 빈 주문 금지
    Order o = Order.create(cmd);
    events.publish(new OrderPlaced(o.id));                        // 도메인 이벤트
    return repo.save(o);
}
```

## 1. 정찰 메모 (recon)
- 스택: spring-jpa / 영토: `order` 패키지 = 컨텍스트 후보 1 / 방법론: 규칙·상태머신 있음 → **DDD**
- 핫스팟: `Order.cancel`·`OrderService.place`에 분기 집중 → 깊게 / 진입점: OrderController

## 2. 완성 문서 (docs/domain/order/README.md)

```markdown
---
context: order
method: ddd
role: backend
subdomain: core
stack: spring-jpa
owner_repo: saerang-api
base_commit: a1b2c3d
updated: 2026-06-11
aliases: [주문, 오더, 발주]
consumes: [customer(ACL), catalog(Conformist)]
---

# 주문 (order) 도메인
> /domain 생성·사람 검수 | 기준 커밋 a1b2c3d

## 개요
고객이 상품을 주문하고 결제·배송 상태로 진행시키는 핵심 거래 도메인이다. 주문 생성부터
취소·배송까지의 상태와 그 전이 규칙을 소유한다.

## 서브도메인 분류
**Core** — 거래가 이 사업의 핵심이고 규칙이 가장 복잡하다(상태 전이·취소 정책). 가장 깊게 다룬다.

## 바운디드 컨텍스트 경계
주문 상태·라인·취소 규칙이 한 트랜잭션 일관성으로 묶여 경계를 이룬다(근거: OrderService.java:place `@Transactional`).
고객·상품은 ID로만 참조해 경계 밖이다(근거: Order.java customerId).

## 유비쿼터스 랭귀지
| 용어 | 코드 식별자 | 별칭 | 의미 |
| 주문 | Order | 오더, 발주 | 고객의 1회 구매 단위 |
| 주문 상태 | OrderStatus | 진행 상태 | CREATED→PAID→SHIPPED, 또는 CANCELLED |
| 주문 라인 | OrderLine | 주문 항목 | 주문 내 개별 상품 줄 |

## 핵심 모델 · 애그리거트
**Order**(애그리거트 루트) — 일관성 경계 안에 OrderLine 포함(cascade ALL), 낙관락으로 동시성 보호.
상태 전이: `CREATED → PAID → SHIPPED`, 어디서든 `→ CANCELLED`(단 SHIPPED 제외).
다른 애그리거트(customer)는 ID 참조 (근거: Order.java:Order, cancel).

## 불변조건
- 주문 라인은 최소 1개 — 빈 주문 금지 (근거: OrderService.java place, EmptyOrderException)
- SHIPPED 상태에서는 취소 불가 (근거: Order.java cancel)

## 비즈니스 규칙·정책
- 주문 생성 시 라인 비면 거부 (근거: OrderService.java place)

## 도메인 이벤트
- `OrderPlaced` — 주문 생성 시 발행, 결제·알림 컨텍스트가 구독 (근거: OrderService.java place)

## 주요 흐름
주문 생성: Controller → OrderService.place → 라인 검증 → 저장 → OrderPlaced 발행 (근거: OrderService.java)

## 컨텍스트 맵 관계
- customer: **ACL**(하류) — 고객 정보를 번역층 거쳐 소비 [확인 필요] 번역층 위치 미확인
- catalog: **Conformist**(하류) — 상품 모델을 그대로 사용 (근거: ...)

## 외부 연동
코드에서 확인되지 않음

## 함정·엣지 케이스
- 동시 취소/배송 경합은 @Version 낙관락에 의존 — 충돌 시 재시도 정책은 [확인 필요]

## 미확인·열린 질문 · 경계 개선
- [확인 필요] customer ACL 번역층의 실제 위치
- [제안] OrderLine을 별도 조회가 많다면 별 애그리거트로 분리 검토 — 사람 확정 필요

## 관련 코드 맵
- order/domain/Order.java — 애그리거트 루트·상태 전이
- order/app/OrderService.java — 유스케이스·이벤트 발행
```

## 3. 이 예시가 보여주는 것
- frontmatter에 **별칭·method·관계** → RAG 라우팅 / 사실마다 **근거 인라인** → 청크 자기완결
- 추정·미확인은 **본문이 아니라 마커로** / `[제안]`은 사실과 분리 / 죽은코드·일반론 없음
- 작아서 한 파일로 뒀지만, 규칙·흐름이 길어지면 rules.md·flows.md로 청크 분할(doc-template 3절)
