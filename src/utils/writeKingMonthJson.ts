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
    const ids: string[] = [];

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
 * 주어진 kingIdentifier에 해당하는 파일들을 원본 디렉토리(../data/original)에서 찾은 후,
 * 파일명에서 그룹명(예: woa, wob, wna, wnb, wra, wrb 등)을 추출하여
 * 해당 그룹에 속하는 파일들 각각을 sax로 파싱해 <level3> 태그의 id 값만 추출하고,
 * 그룹별로 JSON 파일 (예: woa_monthIds.json, wob_monthIds.json, wna_monthIds.json, …)로 저장하는 함수.
 *
 * kingIdentifier가 한 글자라면, 두 번째 글자가 kingIdentifier와 일치하는 모든 그룹을 처리합니다.
 * kingIdentifier가 두 글자 이상이라면, 'w' + kingIdentifier로 시작하는 그룹만 처리합니다.
 */
export async function writeMonthIdsJson(
  kingIdentifier: keyof typeof kingNameMap,
  __dirname: string,
) {
  const originalDir = path.join(__dirname, '../data/original');

  try {
    const files = await fs.readdir(originalDir);

    // 그룹별로 파일명을 묶음 (예: "woa": [...], "wna": [...], "wnb": [...], "wra": [...], "wrb": [...])
    const groupedFiles = files.reduce<Record<string, string[]>>(
      (acc, fileName) => {
        const match = fileName.match(/^2nd_(w[^_]+)_/);
        if (match && match[1]) {
          const groupName = match[1];
          // kingIdentifier가 한 글자라면, 그룹명 두 번째 글자가 kingIdentifier여야 함.
          // kingIdentifier가 두 글자 이상이면 그룹명이 "w" + kingIdentifier로 시작해야 함.
          if (
            (kingIdentifier.length === 1 &&
              groupName.charAt(1) === kingIdentifier) ||
            (kingIdentifier.length > 1 &&
              groupName.startsWith(`w${kingIdentifier}`))
          ) {
            if (!acc[groupName]) {
              acc[groupName] = [];
            }
            acc[groupName].push(fileName);
          }
        }
        return acc;
      },
      {},
    );

    if (Object.keys(groupedFiles).length === 0) {
      console.error(
        `No files found relating ${kingNameMap[kingIdentifier]} in ${originalDir}`,
      );
      return;
    }

    // 각 그룹별로 파일들을 처리하여 JSON 파일 생성
    const outputDir = path.join(__dirname, '../data/processed/json/months');
    await fs.mkdir(outputDir, { recursive: true });

    for (const groupName in groupedFiles) {
      const fileNames = groupedFiles[groupName];
      let allIds: string[] = [];
      for (const fileName of fileNames) {
        const filePath = path.join(originalDir, fileName);
        const extractedIds = await extractMonthIds(filePath);
        allIds = allIds.concat(extractedIds);
      }

      // 그룹별 JSON 파일명 (예: woa_monthIds.json)
      const jsonFileName = `${groupName}_monthIds.json`;
      const jsonOutputPath = path.join(outputDir, jsonFileName);

      await fs.writeFile(
        jsonOutputPath,
        JSON.stringify(allIds, null, 2),
        'utf-8',
      );
      console.log(`Processed and wrote JSON to ${jsonOutputPath}`);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}
