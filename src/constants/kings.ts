export const kingIdentifierList = Array.from({ length: 25 }, (_, i) =>
  String.fromCharCode(97 + i),
);

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
  n: '선조', // na, nb
  o: '광해군', // oa, ob
  p: '인조',
  q: '효종',
  r: '현종', // ra, rb
  s: '숙종', // sa, sb
  t: '경종', // ta, tb
  u: '영조',
  v: '정조',
  w: '순조',
  x: '헌종',
  y: '철종',
};

export const getKingIdentifier = (kingName: string) => {
  return (
    Object.keys(kingNameMap).find(
      (key) => kingNameMap[key as keyof typeof kingNameMap] === kingName,
    ) || null
  );
};
