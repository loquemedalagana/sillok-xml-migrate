// src/app.ts
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

import { getKingIdentifier } from './constants/index.js';
import { parseXML, parseDtd } from './parsers/index.js';

// ES Module 환경에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prisma 클라이언트 (직접 생성 or src/config/prisma.ts에서 import)
const prisma = new PrismaClient();

/**
 * 주어진 왕 이름(kingName)에 대한 XML & DTD 파싱, 결과 저장, DB 연결 등
 */
export async function runApp(kingName: string) {
  try {
    // 1) 식별자(예: '연산군' → 'j')
    const kingIdentifier = getKingIdentifier(kingName);

    if (!kingIdentifier) {
      throw new Error(`${kingName}에 해당하는 identifier가 존재하지 않습니다.`);
    }

    // 2) XML 파일명 결정 (여기서는 "2nd_wj" + "a_1" = "2nd_wja_1.xml" 가정)
    const originalXMLFileName = `2nd_w${kingIdentifier}a_100`;

    // 3) XML, DTD 경로
    const xmlFilePath = path.join(
      __dirname,
      `../data/original/${originalXMLFileName}.xml`,
    );
    const dtdFilePath = path.join(__dirname, '../data/original/history.dtd');

    // 4) XML 파싱
    const xmlData = await parseXML(xmlFilePath);
    console.log('XML 파싱 결과:', JSON.stringify(xmlData, null, 2));

    // 5) DTD 파싱
    const dtdData = await parseDtd(dtdFilePath);
    // console.log('DTD 파싱 결과:', JSON.stringify(dtdData, null, 2));

    // 6) 결과 저장할 폴더
    const outputDir = path.join(__dirname, '../data/processed/json');
    await fs.mkdir(outputDir, { recursive: true });

    // 7) 파싱 결과를 JSON 파일로 저장

    const xmlOutputPath = path.join(
      outputDir,
      `parsed-xml-${originalXMLFileName.replace('2nd_w', '')}.json`,
    );
    const dtdOutputPath = path.join(outputDir, 'parsed-dtd.json');

    await fs.writeFile(
      xmlOutputPath,
      JSON.stringify(xmlData, null, 2),
      'utf-8',
    );
    console.log(`XML 파싱 결과가 ${xmlOutputPath}에 저장되었습니다.`);

    await fs.writeFile(
      dtdOutputPath,
      JSON.stringify(dtdData, null, 2),
      'utf-8',
    );
    console.log(`DTD 파싱 결과가 ${dtdOutputPath}에 저장되었습니다.`);

    // 8) DB 연결 테스트
    await prisma.$connect();
    console.log('DB 연결 성공!');

    // 필요하면 여기서 Prisma로 insert, select 등 수행 가능
    // await prisma.myTable.create({ data: { ... } });
  } catch (error) {
    console.error('runApp() 실행 중 오류 발생:', error);
  } finally {
    // 항상 Prisma 연결 해제
    await prisma.$disconnect();
  }
}
