# 워크드 예제 — 코드에서 사람이 읽는 도메인 가이드까지

> storyteller가 재현할 **완성 형식의 본보기**. 같은 입력 코드(example.md의 order 도메인)를
> 코딩 레디 레퍼런스가 아니라 **비개발자용 서사 가이드**로 쓰면 이렇게 된다. 차이에 주목:
> 코드명은 괄호 근거로만, 문장 주어는 사람/사건, 규칙은 숫자 예시, 흐름은 이야기.

## 0. 입력 코드 (발췌)

```java
@Entity class Order {
    OrderStatus status;          // CREATED, PAID, SHIPPED, CANCELLED
    Long customerId; List<OrderLine> lines;
    void cancel() { if (status == SHIPPED) throw new IllegalStateException("배송 후 취소 불가"); status = CANCELLED; }
}
@Transactional Order place(PlaceOrderCmd cmd) {
    if (cmd.lines().isEmpty()) throw new EmptyOrderException();
    events.publish(new OrderPlaced(o.id)); return repo.save(o);
}
```

## 1. 완성 문서 (docs/story/order.md)

```markdown
---
domain: order
title: 주문
aliases: [주문, 오더, 발주, 주문취소, 주문상태]
audience: 기획자·신규입사자·비개발자
source_repo: saerang-api
base_commit: a1b2c3d
updated: 2026-06-13
related_docs: [docs/domain/order/README.md]
---

# 주문 — 도메인 가이드
> /domain-story 생성·사람 검수 | 기준 커밋 a1b2c3d | 독자: 비개발자

## 한눈에 (TL;DR)
주문 도메인은 고객이 상품을 사고 그 거래가 결제·배송으로 진행되는 과정을 담당한다.
주문은 만들어진 뒤 결제·배송 단계를 거치며, 배송 전까지는 취소할 수 있다.
한 주문 안에는 여러 상품 줄(주문 항목)이 들어간다.

## 이 도메인은 무엇이고 왜 있나
고객의 "한 번의 구매"를 하나의 단위로 묶어 관리하기 위한 도메인이다. 어떤 상품을 몇 개 샀고,
지금 결제·배송이 어디까지 갔는지, 취소가 가능한지를 이 도메인이 책임진다 (근거: Order.java).
[확인 필요] 부분 취소·환불을 별도 도메인이 맡는지 여부.

## 누가 쓰나 (등장인물)
| 등장인물 | 누구 | 이 도메인에서 하는 일 |
| --- | --- | --- |
| 고객 | 상품을 사는 사람 | 주문을 만들고, 배송 전 취소한다 (근거: OrderService.place) |
| 시스템 | 주문 처리 로직 | 빈 주문을 막고, 주문 생성을 다른 영역(결제·알림)에 알린다 (근거: OrderPlaced 발행) |

## 용어집 (쉬운 말로)
| 용어 | 쉬운 정의 | 별칭 | 참고 코드명 |
| --- | --- | --- | --- |
| 주문 | 고객의 1회 구매 단위 | 오더, 발주 | Order |
| 주문 상태 | 주문이 지금 어느 단계인지 | 진행 상태 | OrderStatus |
| 주문 항목 | 주문 안의 개별 상품 줄 | 주문 라인 | OrderLine |

## 주요 시나리오 (이야기로 보는 흐름)
### 고객이 주문을 넣으면?
고객이 장바구니에서 주문을 넣으면, 시스템은 먼저 담긴 상품이 하나라도 있는지 확인한다. 비어 있으면
주문이 거부된다. 정상이면 주문이 "생성됨" 상태로 저장되고, 결제·알림 같은 다른 영역에 "주문이
들어왔다"고 알린다 (근거: OrderService.place, OrderPlaced).

### 고객이 주문을 취소하면?
배송이 시작되기 전이라면 주문을 취소할 수 있고 상태가 "취소됨"으로 바뀐다. 하지만 이미 배송이
시작된 주문은 취소할 수 없다 (근거: Order.cancel).

## 비즈니스 규칙 (예시 포함)
- **빈 주문 금지**: 상품이 0개인 주문은 만들 수 없다. (예: 장바구니가 빈 채로 주문 → 거부) (근거: place, EmptyOrderException)
- **배송 후 취소 불가**: 상태가 "배송됨"이면 취소가 막힌다. (예: 결제됨 → 취소 가능 / 배송됨 → 불가) (근거: Order.cancel)

## 자주 헷갈리는 점·함정
- "배송됨" 이후에는 어떤 경우에도 취소 버튼이 동작하지 않는다 — 환불은 별도 절차다 [확인 필요].
- 같은 주문을 두 사람이 동시에 취소·배송하면 충돌 처리는 시스템이 막아주지만, 그 후 재시도 정책은 [확인 필요].

## 자주 묻는 질문 (FAQ)
**Q. 주문은 어떤 단계를 거치나요?** A. 생성됨 → 결제됨 → 배송됨 순서로 가고, 배송 전이면 언제든 취소됨으로 갈 수 있다 (근거: OrderStatus).
**Q. 상품 없이 주문이 만들어질 수 있나요?** A. 아니요. 빈 주문은 거부된다 (근거: place).

## 참고 데이터·매직넘버
해당 없음.

## 더 깊이 (개발자용)
- 코드레벨 구현 문서: docs/domain/order/README.md
- 핵심 파일: order/domain/Order.java(상태·취소), order/app/OrderService.java(주문 생성·이벤트)

## 미확인·열린 질문
- [확인 필요] 부분 취소·환불의 소유 도메인
- [확인 필요] 동시성 충돌 후 재시도 정책
```

## 2. 이 예시가 보여주는 것
- 문장 주어가 **고객·시스템·주문**이지 클래스명이 아니다 — 코드명은 (근거: …)에만
- 규칙마다 **숫자/구체 예시**, 흐름은 **이야기 단락 + 질문형 제목**
- 코드로 못 푸는 "왜"(부분환불 소유·재시도 정책)는 지어내지 않고 **[확인 필요]**
- frontmatter의 **별칭**으로 RAG 라우팅 / 개발 디테일은 "더 깊이"로 위임(중복 ✗)
