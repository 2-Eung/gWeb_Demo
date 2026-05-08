# Python — FastAPI 분석 서비스

## 스택
- FastAPI + Uvicorn / Python venv 필수
- SQLAlchemy 2.x (세션: `db.py`)
- pgvector 0.4.1, psycopg2-binary
- Pydantic v2, python-dotenv

## 환경 설정
- 가상환경: `venv/` (항상 활성화 후 작업)
- 환경변수: `.env` 파일 (DB URL, API Key 등)
- 실행: `uvicorn main:app --reload` → `http://localhost:8000`

## 파일 역할
| 파일 | 역할 |
|------|------|
| `main.py` | FastAPI 앱, 라우터 정의 |
| `db.py` | SQLAlchemy 엔진 + `get_db` 의존성 |
| `embedder.py` | Ollama bge-m3 임베딩 호출 |
| `steam_fetcher.py` | Steam API / SteamSpy API HTTP 호출 |

## 엔드포인트
| Method | Path | 역할 |
|--------|------|------|
| POST | `/fetch` | appid → Steam/SteamSpy 수집 → DB 저장 |
| POST | `/analyze` | 질의 → 임베딩 + pg_trgm → 유사 게임 IDs 반환 |

## DB 연결
- DB: `gweb2` / user: `gweb2` / pw: `password` / 포트: 5432
- 테이블 DDL은 **백엔드 Flyway가 관리** — Python에서 테이블 생성 금지
- 쿼리는 `text()` raw SQL 사용 (ORM 모델 정의 없음)

## 임베딩
- Ollama `bge-m3` 모델: `http://localhost:11434`
- `embedder.py` 의 `embed(text: str) -> list[float]` 함수만 사용

## 외부 API
- Steam Store API: `https://store.steampowered.com/api/appdetails`
- SteamSpy API: `https://steamspy.com/api.php`
- IGDB 등 추가 API 필요 시 `steam_fetcher.py` 에 함수 추가

## 의존성 관리
```bash
pip install -r requirements.txt   # 설치
pip freeze > requirements.txt     # 업데이트 후 반드시 갱신
```
