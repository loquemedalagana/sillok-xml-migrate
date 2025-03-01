import fs from 'fs/promises';
import { parseStringPromise } from 'xml2js';

export async function parseXML(filePath: string) {
  try {
    const xmlData = await fs.readFile(filePath, 'utf-8');
    const result = await parseStringPromise(xmlData);
    return result;
  } catch (error) {
    console.error(`XML 파싱 오류 (${filePath}):`, error);
    return null;
  }
}
