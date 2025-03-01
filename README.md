## `.env` file

```aiignore
DATABASE_URL="postgresql://[user-id]:[password]@localhost:5432/sillok"
```

## postgreSQL DB setup
```bash
docker pull postgres:13

docker volume create [volumn name]

docker run -d --name [container name] -e POSTGRES_PASSWORD=[password] -p 5432:5432 -v [container name]:/var/lib/postgresql/data postgres:13

```

```sql
postgres=# CREATE USER "sillok-admin" WITH PASSWORD '[password]';
CREATE ROLE
    postgres=# CREATE DATABASE sillok WITH OWNER "sillok-admin" ENCODING 'UTF8';
CREATE DATABASE
postgres=# GRANT ALL PRIVILEGES ON DATABASE sillok TO "sillok-admin";
```

```bash
docker exec -it [container_name] psql -U [username] -d [database_name]
```

---

## schema 구조

| 모델                           | 설명                                                                   |
| ------------------------------ | ---------------------------------------------------------------------- |
| **King (왕 정보)**             | 실록의 `id`, `name`, `title`을 저장                                    |
| **Year (연도 정보)**           | 왕(`King`)과 연도를 연결 (예: "광해 1년")                              |
| **Article (기사)**             | XML 원문에서 기사 ID(`id`), 한자 원문(`ch`), 한글 번역(`ko`) 저장      |
| **ArticleKing (기사-왕 관계)** | 하나의 기사가 여러 왕과 연관될 수 있으므로 **다대다(N:N) 관계**로 설정 |

---

## folder structure

```aiignore
.
├── prisma                     # Prisma ORM 관련 (DB 스키마, 마이그레이션)
│   ├── migrations            
│   ├── schema.prisma         
│   └── seed.ts               
│
├── src
│   ├── config                 # 설정 관련 (Prisma, dotenv, logger 등)
│   │   ├── prisma.ts         
│   │   ├── dotenv.ts         
│   │   └── logger.ts         
│   │
│   ├── constants              # 전역 상수, enum, 맵핑
│   │   ├── kings.ts           # 왕 코드, 이름 맵핑 및 유틸
│   │   └── index.ts           # constants 폴더 인덱스, 필요한 상수 재노출
│   │
│   ├── repositories           # 실제 DB/파일 시스템 접근 로직
│   │   └── AnnalsRepository.ts  # 실록(Annals) 관련 파일 로드 or DB 조회
│   │
│   ├── services               # 비즈니스 로직
│   │   ├── AnnalsService.ts     # 왕의 실록 데이터 처리 (연산 등)
│   │   └── YearService.ts       # 연도별 로직 등
│   │
│   ├── utils                  # 공통 유틸 (파일, XML, etc.)
│   │   ├── fileUtils.ts       
│   │   ├── xmlUtils.ts        
│   │   └── constants.ts       # (※ 전역 상수 별도로 둘 수도 있음)
│   │
│   ├── scripts                # 실행 가능한 스크립트 (CLI, 배치 등)
│   │   ├── migrate.ts         
│   │   ├── resetDB.ts         
│   │   └── testParser.ts      
│   │
│   ├── app.ts                 # 메인 로직(서버 구동 or CLI 진입점) 
│   └── index.ts               # 실행 파일 (Node 진입점)
│
├── data                       # XML 원본/가공 데이터 (831MB)
│   ├── original               # 원본 XML 저장소
│   │   ├── waa, wba, wca...   # (예) 그룹화된 폴더 구조
│   │   └── history.dtd        
│   │
│   ├── processed              # 변환된 JSON 또는 SQL 결과
│   └── temp                   # 임시 파일 (에러, 로그 등)
│
├── tests                      # 테스트 (Jest 등)
│   ├── repositories           
│   ├── services              
│   ├── utils                
│   └── ...
│
├── .env                       # 환경 변수
├── package.json               
├── tsconfig.json              
└── README.md

```
