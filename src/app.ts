import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { getKingIdentifier } from './constants/index.js';
import { parseDtd, parseXML } from './parsers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // XML과 DTD 파일 경로 설정 (필요에 따라 경로 수정)
    const kingIdentifier = getKingIdentifier('연산군');

    const originalXMLFileName = `2nd_w${kingIdentifier}a_1`;

    const xmlFile = path.join(
      __dirname,
      `../data/original/${originalXMLFileName}.xml`,
    );

    const dtdFile = path.join(__dirname, '../data/original/history.dtd');

    // XML 파싱
    const xmlData = await parseXML(xmlFile);
    console.log('XML 파싱 결과:');
    console.log(JSON.stringify(xmlData, null, 2));

    // DTD 파싱 (필요한 경우)
    const dtdData = await parseDtd(dtdFile);
    console.log('DTD 파싱 결과:');
    console.log(JSON.stringify(dtdData, null, 2));

    // 결과 저장할 폴더 경로 설정 (data/processed/json)
    const outputDir = path.join(__dirname, '../data/processed/json');
    // 폴더가 없으면 생성 (recursive 옵션 사용)
    await fs.mkdir(outputDir, { recursive: true });

    // XML 파싱 결과를 JSON 파일로 저장
    const xmlOutputPath = path.join(outputDir, 'parsed-xml.json');
    await fs.writeFile(
      xmlOutputPath,
      JSON.stringify(xmlData, null, 2),
      'utf-8',
    );
    console.log(`XML 파싱 결과가 ${xmlOutputPath}에 저장되었습니다.`);

    // DTD 파싱 결과를 JSON 파일로 저장
    const dtdOutputPath = path.join(outputDir, 'parsed-dtd.json');
    await fs.writeFile(
      dtdOutputPath,
      JSON.stringify(dtdData, null, 2),
      'utf-8',
    );
    console.log(`DTD 파싱 결과가 ${dtdOutputPath}에 저장되었습니다.`);

    // 데이터베이스 연결 테스트: 간단한 쿼리 실행
    await prisma.$connect();
    console.log('데이터베이스에 성공적으로 연결되었습니다.');
  } catch (error) {
    console.error('데이터베이스 연결에 실패했습니다:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
