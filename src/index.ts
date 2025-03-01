import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { PrismaClient } from '@prisma/client';
import { parseDtd, parseXML } from './parsers/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    // XML과 DTD 파일 경로 설정 (필요에 따라 경로 수정)
    const xmlFile = path.join(__dirname, '../data/original/2nd_wja_000.xml');
    const dtdFile = path.join(__dirname, '../data/original/history.dtd');

    // XML 파싱
    const xmlData = await parseXML(xmlFile);
    console.log('XML 파싱 결과:');
    console.log(JSON.stringify(xmlData, null, 2));

    // DTD 파싱 (필요한 경우)
    const dtdData = await parseDtd(dtdFile);
    console.log('DTD 파싱 결과:');
    console.log(JSON.stringify(dtdData, null, 2));

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
