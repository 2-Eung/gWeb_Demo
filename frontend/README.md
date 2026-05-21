# 프론트엔드

`gWeb_Demo`의 React + Vite 프론트엔드입니다.

## API 설정

프론트엔드 axios 클라이언트는 API 기본 주소를 `import.meta.env.VITE_API_URL`에서 읽습니다.

- 기준 값: 저장소 루트 `.env`
- 루트 `.env`를 쓰는 이유: `vite.config.js`에서 `envDir: '..'`를 설정해 로컬 Vite와 Docker Compose가 같은 변수를 함께 사용합니다.
- 값이 없을 때 기본값: `http://localhost:8080/api`

## 로컬 개발

저장소 루트에서:

```bash
cp .env.example .env
```

그다음 `frontend/`에서:

```bash
npm install
npm run dev
```

개발 서버 주소는 [http://localhost:5173](http://localhost:5173)입니다.

## Docker 빌드

`docker-compose.yml`은 `VITE_API_URL`을 프론트엔드 빌드 인자로 전달합니다.

`VITE_API_URL`을 변경했다면 프론트엔드 이미지를 다시 빌드하세요.

```bash
docker-compose up --build frontend
```
