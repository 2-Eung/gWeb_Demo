# Backend — Spring Boot

## 스택

- Spring Boot 3.4.5 / Java 17 / Gradle
- JPA (Hibernate), Flyway, Lombok
- pgvector JDBC (`com.pgvector:pgvector:0.1.6`)
- PostgreSQL 18 드라이버

## DB 연결

- DB, user, pw, 포트를 반드시 env에 postgresql에서 생성된 것으로 지정할 것
- 스키마 변경은 반드시 `src/main/resources/db/migration/` 에 Flyway 파일로 추가
- 파일명 규칙: `V{n}__{설명}.sql` (기존: V1, V2, V3)

## 패키지 구조

```
com.gweb2
├── domain
│   ├── game          # Game, GameActor, GameCategory, GameGenre, GameSignal, GameTag
│   └── analysis      # DocumentChunk, UserQuery
└── global
    ├── config        # AppConfig, WebConfig (CORS 등)
    └── exception     # GlobalExceptionHandler
```

## 도메인별 레이어

각 도메인은 `controller / dto / entity / repository / service` 로 구성.
새 도메인 추가 시 동일한 패턴 유지.

## 외부 통신

- Python 서비스: `http://localhost:8000` (RestTemplate / HttpClient)
- Ollama LLM: `http://localhost:11434` (Gemma4 e2b 모델)
- Ollama 임베딩: `http://localhost:11434` (bge-m3 모델)
- Docker Compose는 Ollama 컨테이너를 띄우지 않으므로 호스트 PC에서 로컬 Ollama를 별도로 실행해야 함
- 모든 외부 호출은 `global/config/AppConfig.java` 의 Bean 사용

## API 엔드포인트

| Method | Path | 역할 |
|--------|------|------|
| POST | `/api/games/fetch` | appid → Python /fetch 호출 → DB 저장 |
| GET  | `/api/games/{id}` | 게임 상세 조회 |
| POST | `/api/query` | 사용자 질의 → Python /analyze → LLM → 응답 |

## 주의사항

- 엔티티 변경 시 반드시 Flyway 마이그레이션 파일 함께 작성 (JPA `ddl-auto=validate`)
- pgvector 컬럼은 `String` 타입으로 저장 후 쿼리 시 `CAST(? AS vector)` 사용
- CORS 설정은 `WebConfig.java` 에서 관리
