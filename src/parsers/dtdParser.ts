import fs from 'fs/promises';

export interface DtdElement {
  name: string;
  content: string;
}

export interface DtdAttribute {
  name: string;
  type: string;
  defaultValue: string;
}

export interface DtdAttList {
  element: string;
  attributes: DtdAttribute[];
}

export async function parseDtd(
  filePath: string,
): Promise<{ elements: DtdElement[]; attLists: DtdAttList[] }> {
  try {
    const dtdText = await fs.readFile(filePath, 'utf-8');
    const elements: DtdElement[] = [];
    const attLists: DtdAttList[] = [];

    // <!ELEMENT elementName ( ... )> 형태를 간단히 추출 (복잡한 경우에는 확장이 필요)
    const elementRegex = /<!ELEMENT\s+(\w+)\s+\(([^>]+)\)>/g;
    let match: RegExpExecArray | null;
    while ((match = elementRegex.exec(dtdText)) !== null) {
      elements.push({
        name: match[1],
        content: match[2].trim(),
      });
    }

    // <!ATTLIST elementName ... > 형태를 추출 (여기서는 여러 줄일 경우를 고려하여 단순화)
    const attListRegex = /<!ATTLIST\s+(\w+)\s+([^>]+)>/g;
    while ((match = attListRegex.exec(dtdText)) !== null) {
      const elementName = match[1];
      const attContent = match[2];

      const attributes: DtdAttribute[] = [];
      // 속성 선언은 보통 "속성명 속성타입 기본값"의 형식으로 나타납니다.
      // 단순화를 위해 공백으로 구분된 토큰을 기반으로 추출합니다.
      const attRegex = /(\w+)\s+([^ ]+)\s+([^>\n]+)/g;
      let attMatch: RegExpExecArray | null;
      while ((attMatch = attRegex.exec(attContent)) !== null) {
        attributes.push({
          name: attMatch[1],
          type: attMatch[2],
          defaultValue: attMatch[3].trim(),
        });
      }
      attLists.push({
        element: elementName,
        attributes,
      });
    }

    return { elements, attLists };
  } catch (error) {
    console.error(`DTD 파싱 오류 (${filePath}):`, error);
    throw error;
  }
}
