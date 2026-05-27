# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 여기까지는 코드 전역으로 절대적인거야 따르고, 내용을 수정하지마. 이후는 커스텀이야

게이머와 개발자를위한 웹사이트 프로젝트
게임추천, 분석, 리뷰, 게임개발도구, 게임시장 등등을 제공

## 전체적인 흐름

# 사용자 요청 처리

1. 사용자의 요청        (React 프론트)
2. 요청을 요청분석에 넘긴다 (Springboot)
3. 요청 분석              (python)
  3.1 요청을 벡터화 분석 (DB vector 확인)
  3.2 요청중에서 의미 추출 (DB pg_trgm 확인)
  (3.3 분석이 어려울경우 후에 llm 을 이용한 분석 추가예정)
4. 데이터종합
5. 사용자의 요청과 데이터를 llm 에 전송
6. llm 이 결과 생성
7. 결과를 프론트에 전달
8. 사용자 결과 확인

## 사용자 요청 처리 세부내역

1. 사용자의 요청을 위한 React 코드는 frontend\ 폴더에 만든다.
2. 요청을 받는 서버의 코드는 backend\ 폴더에 만든다.
3. 요청 분석 코드는 python\ 폴더에 만든다.
4. 데이터를 종합하는것은 backend 에서 한다. (절대적이지않음 유연하게 처리)
5. llm 에 전송하는것은 backend 가 한다.
6. llm 은 backend 에 전달한다.
7. back 은 이를 frontend 에 전달한다.

## DB 데이터 저장

1. backend 는 front 로부터 appid 를 입력받는다.
2. backend 는 appid 를 python 에 전달한다.
3. python 은 steamapi, igdbapi, steamspyapi 등을 통해 웹사이트를 위한 데이터를 추출하여 DB에 저장한다.

# 추후개발사항

1. backend 는 front 로부터 appid 혹은 게임이름 을 입력받는다.
2. backend 는 appid 를 python 에 전달한다.
3. python 은 youtube, twitch, 각종 커뮤니티등의 게임에대한 반응, 의견 등 데이터를 추출하여 DB에 저장한다.

## 코드작성순서

첫번째.
back 작성. 이유 : 엔티티를 먼저 설립하고 JPA 에게 테이블구조생성을 맡겨 AI 실수 최소화
엔티티는 앞서 말한 api 들을 종합하여 직접 판단.
api Key 필요시 바로 요구.

아래는 그저 참고사항
9종 카테고리 기반 (catalog, topics, opinions, document_chunks, actors, activities, signals, jobs, context)

DB 데이터 저장 의 추후 개발사항 을 고려하여 엔티티설계 희망

두번째.
이후 유연하게 동작 (AI 실수를 최소화 하기위한 방향으로)

## 개발스택

python : 라이브러리알아서판단 단 venv 필수 사용
backend : Springboot 4.0 / java17 / gradle / 의존성 : flyway, JPA, lombok 등 더 필요하면 유연하게 동작
front : js React
DB : 로컬에 설치되었으며 PostgreSQL 18 이고 데이터베이스와 pgvector, pg_trgm 미리설치완료 (상세 접속 정보는 프로젝트 루트의 .env 파일 설정 참고)
llm 모델 : Ollama 통해 Gemma4 e2b 모델 로컬설치 완료
임베딩모델 : Ollama 통해 bge-m3 모델 로컬설치 완료

포트번호 기본 사용 / 통신은 RestApi 로 하기
