# Frontend — React

## 스택
- React (JS, not TS) / Vite
- CSS Modules (`.module.css`) — styled-components 금지
- 상태관리: 별도 라이브러리 없음, useState/useEffect 기본 사용

## 디렉토리 구조
```
src/
├── api/          # client.js (axios 인스턴스), game.js (API 함수)
├── components/   # 재사용 컴포넌트 (GameCard, Navbar)
├── hooks/        # 커스텀 훅 (useDebounce)
├── pages/        # 라우트별 페이지 (Chat, Fetch, GameDetail, Home, Search)
└── assets/       # 이미지 등 정적 파일
```

## 페이지 목록
| 파일 | 경로 | 역할 |
|------|------|------|
| Home.jsx | `/` | 메인 페이지 |
| Search.jsx | `/search` | 게임 검색 |
| GameDetail.jsx | `/game/:id` | 게임 상세 |
| Chat.jsx | `/chat` | LLM 질의 채팅 |
| Fetch.jsx | `/fetch` | Steam appid 입력 → 데이터 수집 |

## API 통신
- 백엔드 baseURL: `http://localhost:8080`
- `src/api/client.js` 의 axios 인스턴스 사용, 직접 fetch/axios 호출 금지
- 새 API 함수는 `src/api/game.js` 에 추가

## 컴포넌트 규칙
- 컴포넌트 파일과 같은 이름의 `.module.css` 파일 세트로 관리
- props drilling 2단계 이상이면 구조 재검토
- 새 컴포넌트는 `components/`, 페이지 전용은 해당 `pages/` 안에

## 개발 서버
```bash
npm run dev   # http://localhost:5173
npm run build # dist/ 빌드
```
