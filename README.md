## `.env` file

```aiignore
DATABASE_URL="postgresql://[user-id]:[password]@localhost:5432/sillok"
```

## folder structure

```aiignore
.
├── prisma                    # Prisma ORM 관련 설정
│   ├── migrations            # DB 마이그레이션 기록
│   ├── schema.prisma         # Prisma 스키마 정의
│   └── seed.ts               # 초기 데이터 삽입
│
├── src                       # 주요 소스 코드
│   ├── config                # 설정 관련 파일
│   │   ├── prisma.ts         # Prisma 클라이언트 설정
│   │   ├── dotenv.ts         # 환경 변수 설정
│   │   └── logger.ts         # 로그 관리
│   │
│   ├── db                    # DB 관련 코드
│   │   ├── models            # Prisma 모델과 관련된 데이터 처리
│   │   ├── seed.ts           # 초기 데이터 입력
│   │   └── migration.ts      # 마이그레이션 실행 코드
│   │
│   ├── parsers               # XML 데이터 파싱 관련 로직
│   │   ├── xmlParser.ts      # XML → JSON 변환 로직
│   │   ├── dtdParser.ts      # DTD 구조 파싱
│   │   └── index.ts          # 파서 모듈 인덱스
│   │
│   ├── services              # 주요 비즈니스 로직
│   │   ├── migrateService.ts # XML 데이터를 SQL로 변환
│   │   ├── entryService.ts   # Entry 데이터 처리
│   │   ├── yearService.ts    # Year 데이터 처리
│   │   └── index.ts          # 서비스 모듈 인덱스
│   │
│   ├── utils                 # 공통 유틸리티
│   │   ├── fileUtils.ts      # 파일 처리 유틸리티 (파일 이동, 정리 등)
│   │   ├── dbUtils.ts        # DB 관련 유틸리티
│   │   ├── xmlUtils.ts       # XML 관련 유틸리티
│   │   └── constants.ts      # 전역 상수 관리
│   │
│   ├── scripts               # 실행 가능한 스크립트 (CLI, cron 등)
│   │   ├── migrate.ts        # XML → SQL 마이그레이션 실행
│   │   ├── resetDB.ts        # DB 리셋 스크립트
│   │   └── testParser.ts     # XML 파싱 테스트
│   │
│   ├── app.ts                # 프로그램 진입점
│   └── index.ts              # 실행 파일
│
├── data                      # XML 데이터 저장 (831MB 파일)
│   ├── original              # 원본 XML 파일 보관
│   │   ├── waa               # 그룹화된 XML 파일 (예: waa 그룹)
│   │   ├── wba
│   │   ├── wca
│   │   ├── wda
│   │   ├── ...
│   │   ├── history.dtd       # XML 구조 정의 파일
│   │
│   ├── processed             # 변환된 JSON 또는 SQL 데이터
│   │   ├── json              # JSON 변환 결과 저장
│   │   ├── sql               # SQL 변환 결과 저장
│   │
│   └── temp                  # 임시 데이터 저장소
│       ├── errors            # 에러 발생한 XML 저장
│       ├── logs              # 처리 로그 저장
│
├── tests                     # 테스트 코드
│   ├── parsers               # XML 파싱 테스트
│   ├── services              # 서비스 로직 테스트
│   ├── db                    # DB 관련 테스트
│   └── utils                 # 유틸리티 테스트
│
├── .env                      # 환경 변수 설정 파일
├── eslint.config.mjs         # ESLint 설정
├── package.json              # 프로젝트 종속성 설정
├── tsconfig.json             # TypeScript 설정
└── README.md                 # 프로젝트 설명

```