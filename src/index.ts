import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
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
