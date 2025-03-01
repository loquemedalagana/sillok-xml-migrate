import { runApp } from './app.js';

async function bootstrap() {
  // runApp(파싱할 왕 이름) - 예: '연산군'
  await runApp('광해군');
}

// 엔트리 함수 실행
bootstrap().catch((err) => {
  console.error('앱 실행 중 에러가 발생했습니다:', err);
  process.exit(1);
});
