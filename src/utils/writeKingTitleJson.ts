import { kingNameMap } from '../constants/index.js';
import path from 'path';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import sax from 'sax';

export interface KingArticleTitle {
  date: string | sax.QualifiedAttribute;
  mainTitle: string | sax.QualifiedAttribute;
  id?: string | sax.QualifiedAttribute;
}

/**
 * sax를 사용하여 XML 파일 내의 각 <level5> 요소에서
 * id, mainTitle(제목), 그리고 dateOccured의 date 속성을 추출하는 함수.
 */
function extractTitleData(filePath: string) {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, 'utf-8');
    const parser = sax.createStream(true, { trim: true });

    let currentLevel5: KingArticleTitle | null = null;
    let currentTag: string | null = null;
    const results: KingArticleTitle[] = [];

    parser.on('opentag', (node) => {
      if (node.name === 'level5') {
        // <level5> 태그에서 id 속성 추출
        currentLevel5 = {
          id: node.attributes.id || '',
          mainTitle: '',
          date: '',
        };
      } else if (currentLevel5 && node.name === 'mainTitle') {
        currentTag = 'mainTitle';
      } else if (currentLevel5 && node.name === 'dateOccured') {
        // <dateOccured> 태그의 date 속성 추출 (type이 '서기' 인 경우 등 추가 필터링 가능)
        if (node.attributes.date) {
          currentLevel5.date = node.attributes.date;
        }
      }
    });

    parser.on('text', (text) => {
      if (currentLevel5 && currentTag === 'mainTitle') {
        currentLevel5.mainTitle += text;
      }
    });

    parser.on('closetag', (tagName) => {
      if (tagName === 'mainTitle') {
        currentTag = null;
      }
      if (tagName === 'level5') {
        results.push(currentLevel5!);
        currentLevel5 = null;
      }
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      resolve(results);
    });

    stream.pipe(parser);
  });
}

/**
 * 주어진 kingIdentifier (예: 'wja')에 해당하는 파일들을
 * 원본 디렉토리(../data/original)에서 찾아, sax를 통해 제목 데이터만 추출한 후
 * 폴더 경로 `data/processed/json/titles/[kingIdentifier]` 에 JSON 파일로 저장하는 함수.
 * 파일명은 그대로 유지하되 확장자는 .json으로 변경됩니다.
 */
export async function writeTitleJson(
  kingIdentifier: keyof typeof kingNameMap,
  __dirname: string,
) {
  const originalDir = path.join(__dirname, '../data/original');

  try {
    const files = await fs.readdir(originalDir);
    // 파일명이 "2nd_w{kingIdentifier}"로 시작하는 파일들 필터링
    const matchingFiles = files.filter((fileName) =>
      fileName.startsWith(`2nd_w${kingIdentifier}`),
    );

    if (matchingFiles.length === 0) {
      console.error(
        `No files found relating ${kingNameMap[kingIdentifier]} in ${originalDir}`,
      );
      return;
    }

    // 1) 그룹별로 묶어서, 그룹명(예: woa, wob 등) 별로 개수를 출력
    const groupedFiles = matchingFiles.reduce<Record<string, string[]>>(
      (acc, fileName) => {
        // "2nd_woa_100.xml" => 정규식으로 "woa" 그룹 추출
        // ^2nd_(w[^_]+)_.*$
        const match = fileName.match(/^2nd_(w[^_]+)_/);
        if (match && match[1]) {
          const groupName = match[1]; // 예: "woa"
          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push(fileName);
        }
        return acc;
      },
      {},
    );

    // 그룹별 파일 수 콘솔 출력
    for (const groupName of Object.keys(groupedFiles)) {
      console.log(`${groupName}: ${groupedFiles[groupName].length}개`);
    }

    // 각 파일별로 sax 파서를 통해 제목 데이터만 추출 후 JSON으로 저장
    await Promise.all(
      matchingFiles.map(async (fileName) => {
        const filePath = path.join(originalDir, fileName);
        const extractedData = await extractTitleData(filePath);

        // "2nd_woa_100.xml" => "woa" 폴더명 추출
        const newDirname = fileName.replace(/^2nd_(w[^_]+)_.*$/, '$1');

        // "woa" 폴더가 없으면 생성
        const outputDir = path.join(
          __dirname,
          `../data/processed/json/titles/${newDirname}`,
        );
        await fs.mkdir(outputDir, { recursive: true });

        // 파일명은 그대로 사용하고, 확장자만 .json으로 변경 (예: "2nd_wja_100.xml" → "2nd_wja_100.json")
        const jsonFileName = fileName
          .replace(/\.xml$/, '_titles.json')
          .replace('2nd_', '');
        const jsonOutputPath = path.join(outputDir, jsonFileName);

        await fs.writeFile(
          jsonOutputPath,
          JSON.stringify(extractedData, null, 2),
          'utf-8',
        );
        console.log(`Processed and wrote JSON to ${jsonOutputPath}`);
      }),
    );
  } catch (error) {
    console.error('에러 발생:', error);
  }
}
