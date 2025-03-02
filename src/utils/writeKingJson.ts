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
    // `2nd_w{kingIdentifier}`로 시작하는 파일들 필터링
    const matchingFiles = files.filter((fileName) =>
      fileName.startsWith(`2nd_w${kingIdentifier}`),
    );

    if (matchingFiles.length === 0) {
      console.error(
        `No files found relating ${kingNameMap[kingIdentifier]} in ${originalDir}`,
      );
      return;
    }

    // 1) 그룹별로 묶어서, 그룹명(예: wna, wnb 등) 별로 개수를 출력
    const groupedFiles = matchingFiles.reduce<Record<string, string[]>>(
      (acc, fileName) => {
        // "2nd_wna_100.xml" => 그룹명: "wna"
        const match = fileName.match(/^2nd_w(.+?)_/);
        if (match && match[1]) {
          const groupName = `w${kingIdentifier}${match[1].slice(kingIdentifier.length)}`;
          // 만약 "wna"가 아니라, 정규식 그룹 전체 "na"만 분리하고 싶다면
          // 위의 groupName 부분은 적절히 바꿔주세요.
          // 예: const groupName = match[1]; // => "wna"

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
      console.log(
        `${kingNameMap[kingIdentifier]}(${groupName}): ${groupedFiles[groupName].length}개`,
      );
    }

    // 2) 각 파일별로 처리 (XML 파싱 & JSON 변환)
    await Promise.all(
      matchingFiles.map(async (fileName) => {
        const filePath = path.join(originalDir, fileName);

        // XML 파일 파싱
        const parsedXmlData = await parseXML(filePath);

        if (!parsedXmlData) {
          console.error(`XML 파싱에 실패했습니다: ${fileName}`);
          return;
        }

        console.log('XML 파싱 결과:', JSON.stringify(parsedXmlData, null, 2));

        // "2nd_wna_100.xml" => "wna" 폴더명 추출
        // 정규식에서 ^2nd_w(.+?)_.*$ 로 전체를 매칭한 뒤, $1 부분이 "wna"
        const newDirname = fileName.replace(/^2nd_w(.+?)_.*$/, '$1');

        const outputDir = path.join(
          __dirname,
          `../data/processed/json/${newDirname}`,
        );
        await fs.mkdir(outputDir, { recursive: true });

        const jsonFileName = fileName.replace(/\.xml$/, '.json');
        const jsonOutputPath = path.join(outputDir, jsonFileName);

        await fs.writeFile(
          jsonOutputPath,
          JSON.stringify(parsedXmlData, null, 2),
          'utf-8',
        );
        console.log(`Processed and wrote JSON to ${jsonOutputPath}`);
      }),
    );
  } catch (error) {
    console.error('에러 발생:', error);
  }
}
