/**
 * a~y (25글자) => 태조부터 철종까지의 왕 코드
 */
export const kingIdentifierList = Array.from({ length: 25 }, (_, i) =>
  String.fromCharCode(97 + i),
);

/**
 * 왕 코드 → 왕 이름 맵핑
 * 주석: b까지 있는 왕(예: na, nb) => 수정실록이 존재
 *       나머지 => 기본 w + 왕 코드 + a 만 존재
 */
export const kingNameMap = {
  a: '태조',
  b: '정종',
  c: '태종',
  d: '세종',
  e: '문종',
  f: '단종',
  g: '세조',
  h: '예종',
  i: '성종',
  j: '연산군',
  k: '중종',
  l: '인종',
  m: '명종',
  n: '선조', // 선조는 na, nb (수정실록)
  o: '광해군', // 광해군은 oa, ob (수정실록)
  p: '인조',
  q: '효종',
  r: '현종', // 현종은 ra, rb
  s: '숙종', // 숙종은 sa, sb
  t: '경종', // 경종은 ta, tb
  u: '영조',
  v: '정조',
  w: '순조',
  x: '헌종',
  y: '철종',
} as const;

/**
 * 왕 이름(예: '광해군') → 왕 코드('o') 조회
 */
export function getKingIdentifier(kingName: string): string | null {
  return (
    Object.keys(kingNameMap).find(
      (key) => kingNameMap[key as keyof typeof kingNameMap] === kingName,
    ) || null
  );
}

/**
 * 왕 코드('o') → 왕 이름('광해군') 조회
 */
export function getKingName(identifier: string): string | null {
  return (kingNameMap as Record<string, string>)[identifier] || null;
}
