// src/app.ts
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

import {
  getKingIdentifier,
  kingIdentifierList,
  kingNameMap,
} from './constants/index.js';
import { writeKingJson, writeTitleJson } from './utils/index.js';

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

    await writeKingJson(kingIdentifier as keyof typeof kingNameMap, __dirname);
    await writeTitleJson(kingIdentifier as keyof typeof kingNameMap, __dirname)

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
