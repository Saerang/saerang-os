/**
 * 이메일 로컬파트의 앞 2글자만 남기고 나머지를 *로 마스킹한다.
 * 예: "tonystark@example.com" → "to*******@example.com"
 *
 * - 이메일 형식이 아니면(@ 없음, 로컬파트/도메인 비어 있음 등) 에러 대신 원문을 반환한다.
 * - 로컬파트가 2글자 이하면 가릴 글자가 없으므로 원문을 반환한다.
 *
 * @param {string} email
 * @returns {string}
 */
export function maskEmail(email) {
  if (typeof email !== 'string') return email;

  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex === email.length - 1) return email;
  if (email.indexOf('@', atIndex + 1) !== -1) return email;

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (localPart.length <= 2) return email;

  return `${localPart.slice(0, 2)}${'*'.repeat(localPart.length - 2)}@${domain}`;
}
