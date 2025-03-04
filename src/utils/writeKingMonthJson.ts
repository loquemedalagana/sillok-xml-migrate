import { kingNameMap } from '../constants/index.js';
import path from 'path';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import sax from 'sax';

/**
 * sax를 사용하여 XML 파일 내의 모든 <level3> 요소에서
 * id 속성을 추출하는 함수.
 * 예시: <level3 id="wja_100120"> 에서 "wja_100120"만 추출
 */
function extractMonthIds(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, 'utf-8');
    const parser = sax.createStream(true, { trim: true });

    const ids: Array<string> = [];

    parser.on('opentag', (node) => {
      if (node.name === 'level3') {
        const id = node.attributes.id || '';
        if (id) {
          ids.push(id as string);
        }
      }
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      resolve(ids);
    });

    stream.pipe(parser);
  });
}

/**
 * 주어진 kingIdentifier (예: 'wja')에 해당하는 파일들을
 * 원본 디렉토리(../data/original)에서 찾아, sax를 통해 <level3> 태그의 id 값만 추출한 후
 * 폴더 경로 `data/processed/json/months/[kingIdentifier]_monthIds.json` 에 JSON 파일로 저장하는 함수.
 * 예: data/processed/json/months/wja_monthIds.json
 */
export async function writeMonthIdsJson(
  kingIdentifier: keyof typeof kingNameMap,
  __dirname: string,
) {
  const originalDir = path.join(__dirname, '../data/original');

  try {
    const files = await fs.readdir(originalDir);
    // 파일명이 kingIdentifier로 시작하는 파일들 필터링 (예: "wja")
    const matchingFiles = files.filter((fileName) =>
      fileName.startsWith(`2nd_w${kingIdentifier}a`),
    );

    if (matchingFiles.length === 0) {
      console.error(
        `No files found relating ${kingNameMap[kingIdentifier]} in ${originalDir}`,
      );
      return;
    }

    console.log(
      `Found ${matchingFiles.length} file(s) for ${kingNameMap[kingIdentifier]}`,
    );

    // 각 파일별로 sax 파서를 통해 데이터를 추출하고, 모든 id를 합침
    let allIds: string[] = [];
    for (const fileName of matchingFiles) {
      const filePath = path.join(originalDir, fileName);
      const extractedIds = await extractMonthIds(filePath);
      allIds = allIds.concat(extractedIds);
    }

    // 단일 JSON 파일로 저장: data/processed/json/months/[kingIdentifier]_monthIds.json
    const outputDir = path.join(__dirname, '../data/processed/json/months');
    await fs.mkdir(outputDir, { recursive: true });

    const jsonFileName = `w${kingIdentifier}a_monthIds.json`;
    const jsonOutputPath = path.join(outputDir, jsonFileName);

    await fs.writeFile(
      jsonOutputPath,
      JSON.stringify(allIds, null, 2),
      'utf-8',
    );
    console.log(`Processed and wrote JSON to ${jsonOutputPath}`);
  } catch (error) {
    console.error('에러 발생:', error);
  }
}
