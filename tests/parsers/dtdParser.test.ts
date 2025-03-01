import path from 'path';
import { parseDtd, DtdElement, DtdAttList } from '../../src/parsers';

describe('DTD Parser', () => {
  const dtdFilePath = path.join(__dirname, '../../data/original/history.dtd');

  it('should parse ELEMENT declarations correctly', async () => {
    const { elements } = await parseDtd(dtdFilePath);
    expect(Array.isArray(elements)).toBe(true);
    // 예시: DTD에 "item" 요소가 포함되어 있다고 가정 (원문 DTD에 따라 수정 필요)
    const itemElement = elements.find((el: DtdElement) => el.name === 'item');
    expect(itemElement).toBeDefined();
    // item 요소의 content가 비어있지 않아야 함
    expect(itemElement?.content.length).toBeGreaterThan(0);
  });

  it('should parse ATTLIST declarations correctly', async () => {
    const { attLists } = await parseDtd(dtdFilePath);
    expect(Array.isArray(attLists)).toBe(true);
    // 최소한 하나 이상의 ATTLIST가 파싱되어야 함
    expect(attLists.length).toBeGreaterThan(0);
    // 예시: 특정 요소에 대해 속성이 올바르게 추출되었는지 확인
    const itemAttList = attLists.find(
      (att: DtdAttList) => att.element === 'item',
    );
    if (itemAttList) {
      expect(itemAttList.attributes.length).toBeGreaterThan(0);
    }
  });

  it('to see the parsed result', async () => {
    const result = await parseDtd('data/original/history.dtd');
    console.log('파싱 결과:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
  });
});
