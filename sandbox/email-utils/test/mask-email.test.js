import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maskEmail } from '../src/mask-email.js';

test('로컬파트 앞 2글자만 남기고 마스킹한다', () => {
  assert.equal(maskEmail('tonystark@example.com'), 'to*******@example.com');
  assert.equal(maskEmail('abc@test.io'), 'ab*@test.io');
});

test('로컬파트가 2글자 이하면 원문을 반환한다', () => {
  assert.equal(maskEmail('ab@test.io'), 'ab@test.io');
  assert.equal(maskEmail('a@test.io'), 'a@test.io');
});

test('잘못된 이메일 형식은 원문을 반환한다', () => {
  assert.equal(maskEmail('not-an-email'), 'not-an-email');
  assert.equal(maskEmail('@example.com'), '@example.com');
  assert.equal(maskEmail('user@'), 'user@');
  assert.equal(maskEmail('a@b@c.com'), 'a@b@c.com');
  assert.equal(maskEmail(''), '');
});

test('문자열이 아닌 입력은 그대로 반환한다', () => {
  assert.equal(maskEmail(null), null);
  assert.equal(maskEmail(undefined), undefined);
  assert.equal(maskEmail(123), 123);
});
