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
 * 주어진 kingIdentifier (예: 'oa')에 해당하는 파일들을
 * 원본 디렉토리(../data/original)에서 찾아, 파일명에서 그룹명(예: woa, wob)을 추출한 후
 * 각 그룹별로 sax를 통해 <level3> 태그의 id 값만 추출하여
 * 폴더 경로 `data/processed/json/months/` 에 그룹별 JSON 파일 (예: woa_monthIds.json, wob_monthIds.json)로 저장하는 함수.
 */
export async function writeMonthIdsJson(
  kingIdentifier: keyof typeof kingNameMap,
  __dirname: string,
) {
  const originalDir = path.join(__dirname, '../data/original');

  try {
    const files = await fs.readdir(originalDir);
    // 정규식을 사용하여 파일명에서 그룹명을 추출하고, kingIdentifier와 매칭되는 파일들만 필터링.
    const matchingFiles = files.filter((fileName) => {
      const match = fileName.match(/^2nd_(w[^_]+)_/);
      if (match && match[1]) {
        // 그룹명이 kingIdentifier로 시작하는지 확인
        // 예를 들어 kingIdentifier가 "oa"라면, "woa" 또는 "wob" 등에서 "oa"가 포함될 수 있음.
        return match[1].includes(kingIdentifier);
      }
      return false;
    });

    if (matchingFiles.length === 0) {
      console.error(
        `No files found relating ${kingNameMap[kingIdentifier]} in ${originalDir}`,
      );
      return;
    }

    // 그룹별로 파일명을 묶음 (예: "woa": [...], "wob": [...])
    const groupedFiles = matchingFiles.reduce<Record<string, string[]>>(
      (acc, fileName) => {
        const match = fileName.match(/^2nd_(w[^_]+)_/);
        if (match && match[1]) {
          const groupName = match[1];
          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push(fileName);
        }
        return acc;
      },
      {},
    );

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
