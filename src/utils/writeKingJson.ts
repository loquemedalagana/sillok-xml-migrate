import { kingNameMap } from '../constants/index.js';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { promises as fs } from 'fs';

async function parseXML(filePath: string) {
  try {
    const xmlData = await fs.readFile(filePath, 'utf-8');
    return await parseStringPromise(xmlData);
  } catch (error) {
    console.error(`XML 파싱 오류 (${filePath}):`, error);
    return null;
  }
}

export async function writeKingJson(
  kingIdentifier: keyof typeof kingNameMap,
  __dirname: string,
) {
  const originalDir = path.join(__dirname, '../data/original');

  try {
    const files = await fs.readdir(originalDir);
    // `2nd_w{kingIdentifier}` 로 시작하는 파일만 필터링
    const matchingFiles = files.filter((fileName) =>
      fileName.startsWith(`2nd_w${kingIdentifier}`),
    );

    if (matchingFiles.length === 0) {
      console.error(
        `No files found relating ${kingNameMap[kingIdentifier]} in ${originalDir}`,
      );
      return;
    }

    console.log(`Found matching files:`, matchingFiles.length);

    await Promise.all(
      matchingFiles.map(async (fileName) => {
        const filePath = path.join(originalDir, fileName);

        // XML 파일 파싱
        const xmlData = await parseXML(filePath);
        if (!xmlData) {
          console.error(`XML 파싱에 실패했습니다: ${fileName}`);
          return;
        }
        console.log('XML 파싱 결과:', JSON.stringify(xmlData, null, 2));

        // 예: "2nd_wna_100.xml" => newDirname: "wna"
        const newDirname = fileName.replace(/^2nd_w(.+?)_.*$/, '$1');

        // 출력 폴더 생성
        const outputDir = path.join(
          __dirname,
          `../data/processed/json/${newDirname}`,
        );
        await fs.mkdir(outputDir, { recursive: true });

        // JSON 파일 이름 결정
        const jsonFileName = fileName.replace(/\.xml$/, '.json');
        const jsonOutputPath = path.join(outputDir, jsonFileName);

        // xmlData를 원하는 대로 가공 후 저장 (예: 그대로 JSON 변환)
        // 필요하다면 xmlData를 가공해서 원하는 형태로 만들 수 있습니다.
        const jsonData = {
          // 이곳에서 xmlData의 구조를 보고 필요한 형태로 변환해 주세요.
          parsed: xmlData,
        };

        await fs.writeFile(
          jsonOutputPath,
          JSON.stringify(jsonData, null, 2),
          'utf-8',
        );
        console.log(`Processed and wrote JSON to ${jsonOutputPath}`);
      }),
    );
  } catch (error) {
    console.error('에러 발생:', error);
  }
}
