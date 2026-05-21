# gWeb_Demo Project

이 프로젝트는 다음 구성으로 이루어져 있습니다.

- React + Vite 프론트엔드
- Spring Boot 백엔드
- FastAPI Python 서비스
- `pgvector`를 사용하는 PostgreSQL

## 프론트엔드 API URL 설정

프론트엔드는 API 기본 주소를 `VITE_API_URL`에서 읽습니다.

- 로컬 프론트엔드 개발: `frontend/vite.config.js`에서 루트 `.env`를 읽습니다.
- Docker 프론트엔드 빌드: `docker-compose.yml`이 같은 `VITE_API_URL` 값을 프론트엔드 이미지 빌드 인자로 전달합니다.
- 값이 없으면 기본값은 `http://localhost:8080/api`입니다.

먼저 예제 env 파일을 복사해 루트 `.env`를 만듭니다.

```bash
cp .env.example .env
```

기본값이 아닌 다른 API 주소를 쓰려면 루트 `.env`에서 `VITE_API_URL`만 수정하면 됩니다.

## Docker 실행

```bash
docker compose up --build
```

Compose는 다음 순서로 준비 상태를 확인한 뒤 서비스를 올립니다.

1. `db`가 `pg_isready`로 준비 완료 상태가 될 때까지 대기합니다.
2. `python-api`가 DB 연결에 성공해 `/health/ready`를 반환할 때까지 대기합니다.
3. `backend`가 DB와 Python API를 모두 확인해 `/health/ready`를 반환할 때까지 대기합니다.
4. `frontend`는 준비 완료된 백엔드와 Python API 뒤에 기동합니다.

접속 주소:

- 프론트엔드: [http://localhost:3000](http://localhost:3000)
- Python API 문서: [http://localhost:8000/docs](http://localhost:8000/docs)
- Java 백엔드: [http://localhost:8080](http://localhost:8080)

헬스 체크 엔드포인트:

- Python liveness: [http://localhost:8000/health/live](http://localhost:8000/health/live)
- Python readiness: [http://localhost:8000/health/ready](http://localhost:8000/health/ready)
- Backend liveness: [http://localhost:8080/health/live](http://localhost:8080/health/live)
- Backend readiness: [http://localhost:8080/health/ready](http://localhost:8080/health/ready)

프론트엔드의 `VITE_*` 값은 빌드 결과물에 포함되므로, 프론트엔드 env 값을 바꿨다면 `--build`로 다시 이미지 빌드를 해야 합니다.

중지는 다음 명령으로 할 수 있습니다.

```bash
docker compose down
```

## Docker 없이 로컬 실행

사전 준비:

- 로컬 PostgreSQL 실행
- LLM 기능 사용 시 로컬 Ollama 실행
- JDK 17 이상
- Node.js 20 이상

로컬 Vite도 Docker Compose와 같은 `VITE_API_URL` 기준을 따르므로, 먼저 `.env.example`을 복사해 루트 `.env`를 준비합니다.

### Python API

Windows:

```bash
cd python
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

macOS:

```bash
cd python
pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

### Java 백엔드

```bash
cd backend
./gradlew bootRun
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 개발 서버 주소:

- [http://localhost:5173](http://localhost:5173)

`VITE_API_URL`이 비어 있으면 프론트엔드는 `http://localhost:8080/api`를 기본값으로 사용합니다.
