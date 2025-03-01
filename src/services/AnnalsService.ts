// src/services/AnnalsService.ts

import { AnnalsRepository } from '../repositories/index.js';
import path from 'path';

export class AnnalsKing {
  identifier: string;
  name: string;
  files: string[];

  constructor(identifier: string, name: string) {
    this.identifier = identifier;
    this.name = name;
    this.files = [];
  }

  /**
   * 📌 파일 로딩
   */
  async loadFiles(): Promise<void> {
    this.files = await AnnalsRepository.loadFiles(this.identifier);
  }

  /**
   * 📌 재위 기간 (100~115번 XML 파일 갯수)
   */
  getReignYears(): number {
    return this.files.filter((file) => {
      const num = parseInt(file.split('_')[2], 10);
      return num >= 100 && num <= 115;
    }).length;
  }

  /**
   * 📌 특별 파일(000: 제목, 200: 폐위 등)
   */
  getSpecialFiles(): string[] {
    return this.files.filter((file) => {
      const num = parseInt(file.split('_')[2], 10);
      return num === 0 || num === 200;
    });
  }

  /**
   * 📌 정보 출력
   */
  printInfo(): void {
    console.log(`👑 왕: ${this.name} (${this.identifier})`);
    console.log(`📂 총 파일 수: ${this.files.length}`);
    console.log(`📆 재위 기간(파일기준): ${this.getReignYears()}년`);
    console.log(
      `📜 특별 파일: ${this.getSpecialFiles().map((file) => path.basename(file))}`,
    );
    console.log('--------------------------------------------------');
  }
}
