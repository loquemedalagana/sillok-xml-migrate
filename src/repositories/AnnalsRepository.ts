// src/repositories/AnnalsRepository.ts

import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = 'data/original';

export class AnnalsRepository {
  /**
   * 특정 왕(identifier)의 XML 파일 목록을 반환
   */
  static async loadFiles(identifier: string): Promise<string[]> {
    try {
      // 예) 2nd_wnb_***
      // "b까지 있는 왕은 nb, ra, rb ..." 형태도 가능
      const files = await fs.readdir(DATA_DIR);
      // "2nd_w + identifier"를 포함한 파일만 필터
      return files.filter((file) => file.startsWith(`2nd_w${identifier}`));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ 파일 로드 중 오류: ${error.message}`);
      } else {
        console.error(`❌ 알 수 없는 오류 발생: ${JSON.stringify(error)}`);
      }
      return [];
    }
  }

  /**
   * 혹은 그룹 폴더를 구분해서 읽어오고 싶다면?
   */
  static async loadGroupFiles(
    identifier: string,
    groupFolder: string,
  ): Promise<string[]> {
    if (!groupFolder) {
      console.error('❌ 잘못된 groupFolder가 제공되었습니다.');
      return [];
    }

    const sanitizedFolder = groupFolder.replace(/[/\\?%*:|"<>]/g, ''); // 잘못된 문자를 제거
    const dirPath = path.join(DATA_DIR, sanitizedFolder);

    try {
      await fs.access(dirPath); // 경로 접근 가능 여부 확인

      const files = await fs.readdir(dirPath);
      const filteredFiles = files.filter((file) =>
        file.startsWith(`2nd_w${identifier}`),
      );

      if (filteredFiles.length === 0) {
        console.warn(
          `⚠️ 필터링된 파일이 없습니다. identifier: ${identifier}, groupFolder: ${groupFolder}`,
        );
      }

      return filteredFiles;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          `❌ 폴더(${groupFolder}) 파일 로드 오류: ${error.message}`,
        );
      } else {
        console.error(`❌ 알 수 없는 오류 발생: ${JSON.stringify(error)}`);
      }
      return [];
    }
  }
}
