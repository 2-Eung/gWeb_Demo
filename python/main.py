import json
import re
from datetime import datetime, timezone

from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from db import get_db
from embedder import embed
from steam_fetcher import fetch_steam_detail, fetch_steamspy, parse_release_date
from review_fetcher import fetch_steam_reviews
from signal_fetcher import fetch_youtube_signals
from sentiment import score_review, extract_keywords
from novelty import calculate_decay

app = FastAPI(title="gWeb2 Python Service", version="0.1.0")


# ── 요청/응답 모델 ──────────────────────────────────────────────────────────────

class FetchRequest(BaseModel):
    app_id: int


class AnalyzeRequest(BaseModel):
    query: str


class ReviewFetchRequest(BaseModel):
    game_id: int
    app_id: int


class SignalFetchRequest(BaseModel):
    game_id: int
    game_name: str


class AnalyzeResponse(BaseModel):
    embedding: list[float]
    intent: str
    matched_game_ids: list[int]


# ── /fetch : Steam 데이터 수집 → DB 저장 ───────────────────────────────────────

@app.post("/fetch", status_code=200)
def fetch_game(req: FetchRequest, db: Session = Depends(get_db)):
    app_id = req.app_id

    # 이미 있으면 스킵
    exists = db.execute(
        text("SELECT 1 FROM games WHERE steam_appid = :id"), {"id": app_id}
    ).fetchone()
    if exists:
        return {"status": "already_exists"}

    # Steam API 호출
    detail = fetch_steam_detail(app_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Steam app {app_id} not found")

    spy = fetch_steamspy(app_id)

    # 기본 정보 파싱
    price_data = detail.get("price_overview", {})
    release_raw = detail.get("release_date", {}).get("date")
    release_date = parse_release_date(release_raw)

    owners_str = spy.get("owners", "0 .. 0")
    owners_parts = [int(x.strip().replace(",", "")) for x in owners_str.split("..")]

    # 임베딩 생성
    name = detail.get("name", "")
    short_desc = detail.get("short_description", "")
    name_emb = embed(name)
    desc_emb = embed(short_desc) if short_desc else name_emb

    name_emb_str = "[" + ",".join(str(x) for x in name_emb) + "]"
    desc_emb_str = "[" + ",".join(str(x) for x in desc_emb) + "]"

    # games 테이블 저장
    result = db.execute(text("""
        INSERT INTO games (
            steam_appid, name, short_description, detailed_description,
            header_image, release_date, is_free,
            price_initial, price_final, metacritic_score, website,
            owners_min, owners_max,
            average_playtime_forever, median_playtime_forever,
            positive_reviews, negative_reviews,
            name_embedding, desc_embedding,
            data_fetched_at, last_updated_at
        ) VALUES (
            :appid, :name, :short_desc, :detail_desc,
            :header_image, :release_date, :is_free,
            :price_initial, :price_final, :metacritic, :website,
            :owners_min, :owners_max,
            :avg_playtime, :med_playtime,
            :positive, :negative,
            CAST(:name_emb AS vector), CAST(:desc_emb AS vector),
            NOW(), NOW()
        ) RETURNING id
    """), {
        "appid": app_id,
        "name": name,
        "short_desc": short_desc,
        "detail_desc": detail.get("detailed_description", ""),
        "header_image": detail.get("header_image", ""),
        "release_date": release_date,
        "is_free": detail.get("is_free", False),
        "price_initial": price_data.get("initial"),
        "price_final": price_data.get("final"),
        "metacritic": detail.get("metacritic", {}).get("score"),
        "website": detail.get("website", ""),
        "owners_min": owners_parts[0] if len(owners_parts) > 0 else None,
        "owners_max": owners_parts[1] if len(owners_parts) > 1 else None,
        "avg_playtime": spy.get("average_forever"),
        "med_playtime": spy.get("median_forever"),
        "positive": detail.get("recommendations", {}).get("total") or spy.get("positive"),
        "negative": spy.get("negative"),
        "name_emb": name_emb_str,
        "desc_emb": desc_emb_str,
    })
    game_id = result.fetchone()[0]

    # 장르 저장
    for g in detail.get("genres", []):
        db.execute(text("""
            INSERT INTO game_genres (game_id, genre_id, genre_name, source)
            VALUES (:gid, :genre_id, :genre_name, 'steam')
        """), {"gid": game_id, "genre_id": int(g["id"]), "genre_name": g["description"]})

    # 카테고리 저장
    for c in detail.get("categories", []):
        db.execute(text("""
            INSERT INTO game_categories (game_id, category_id, category_name)
            VALUES (:gid, :cid, :cname)
        """), {"gid": game_id, "cid": int(c["id"]), "cname": c["description"]})

    # 개발사/퍼블리셔 저장
    for dev in detail.get("developers", []):
        db.execute(text("""
            INSERT INTO game_actors (game_id, actor_name, actor_type)
            VALUES (:gid, :name, 'DEVELOPER')
        """), {"gid": game_id, "name": dev})

    for pub in detail.get("publishers", []):
        db.execute(text("""
            INSERT INTO game_actors (game_id, actor_name, actor_type)
            VALUES (:gid, :name, 'PUBLISHER')
        """), {"gid": game_id, "name": pub})

    # SteamSpy 태그 저장
    for tag_name, vote_count in (spy.get("tags") or {}).items():
        db.execute(text("""
            INSERT INTO game_tags (game_id, tag_name, vote_count)
            VALUES (:gid, :tag, :votes)
        """), {"gid": game_id, "tag": tag_name, "votes": vote_count})

    # document_chunks 저장 (설명 청크)
    if short_desc:
        chunk_emb_str = desc_emb_str
        db.execute(text("""
            INSERT INTO document_chunks (game_id, chunk_type, content, embedding)
            VALUES (:gid, 'GAME_DESCRIPTION', :content, CAST(:emb AS vector))
        """), {"gid": game_id, "content": short_desc, "emb": chunk_emb_str})

    db.commit()
    return {"status": "ok", "game_id": game_id}


# ── /analyze : 질의 벡터화 + 의미 추출 + 유사 게임 검색 ──────────────────────────

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_query(req: AnalyzeRequest, db: Session = Depends(get_db)):
    query_text = req.query

    # 1. 임베딩
    query_emb = embed(query_text)
    emb_str = "[" + ",".join(str(x) for x in query_emb) + "]"

    # 2. pgvector 유사도 검색 (desc_embedding 기준 상위 5개)
    vector_rows = db.execute(text("""
        SELECT id FROM games
        ORDER BY desc_embedding <=> CAST(:emb AS vector)
        LIMIT 5
    """), {"emb": emb_str}).fetchall()
    vector_ids = [r[0] for r in vector_rows]

    # 3. pg_trgm 키워드 검색 (단어 추출 후 이름/태그 유사도)
    words = re.findall(r'\w+', query_text)
    trgm_ids = []
    if words:
        keyword = " ".join(words[:5])
        trgm_rows = db.execute(text("""
            SELECT id FROM games
            WHERE similarity(name, :kw) > 0.15
            ORDER BY similarity(name, :kw) DESC
            LIMIT 5
        """), {"kw": keyword}).fetchall()
        trgm_ids = [r[0] for r in trgm_rows]

    # 중복 제거하여 합치기
    matched = list(dict.fromkeys(vector_ids + trgm_ids))[:10]

    # 4. 간단한 의도 추출 (단어 기반)
    intent = extract_intent(query_text)

    return AnalyzeResponse(
        embedding=query_emb,
        intent=intent,
        matched_game_ids=matched,
    )


@app.post("/reviews/fetch")
def fetch_reviews(req: ReviewFetchRequest, db: Session = Depends(get_db)):
    reviews = fetch_steam_reviews(req.app_id)
    if not reviews:
        return {"status": "no_reviews", "count": 0}

    for r in reviews:
        score = score_review(r.get("review", ""))
        ts = r.get("timestamp_created", 0)
        db.execute(text("""
            INSERT INTO game_signals (game_id, source_type, source_id, content, author, sentiment_score, engagement_count, collected_at)
            VALUES (:game_id, 'STEAM_REVIEW', :source_id, :content, :author, :sentiment_score, :engagement_count, to_timestamp(:ts))
            ON CONFLICT (source_type, source_id) DO NOTHING
        """), {
            "game_id": req.game_id,
            "source_id": str(r.get("recommendationid", "")),
            "content": r.get("review", ""),
            "author": r.get("author", {}).get("steamid", ""),
            "sentiment_score": score,
            "engagement_count": r.get("votes_up", 0),
            "ts": ts,
        })

    pos_kws, neg_kws = extract_keywords(reviews)
    scores = [score_review(r.get("review", "")) for r in reviews]
    avg_score = round(sum(scores) / len(scores), 3) if scores else None

    game_row = db.execute(
        text("SELECT release_date FROM games WHERE id = :id"), {"id": req.game_id}
    ).fetchone()
    release_date = game_row[0] if game_row else None
    decay = calculate_decay(reviews, release_date)

    steam_count = db.execute(
        text("SELECT COUNT(*) FROM game_signals WHERE game_id = :gid AND source_type = 'STEAM_REVIEW'"),
        {"gid": req.game_id}
    ).scalar()

    db.execute(text("""
        INSERT INTO game_metrics (game_id, steam_review_count, avg_sentiment_score, positive_keywords, negative_keywords,
            decay_score, week1_ratio, month1_ratio, total_analyzed, updated_at)
        VALUES (:game_id, :steam_count, :avg_score, :pos_kws, :neg_kws,
            :decay_score, :week1_ratio, :month1_ratio, :total_analyzed, NOW())
        ON CONFLICT (game_id) DO UPDATE SET
            steam_review_count  = EXCLUDED.steam_review_count,
            avg_sentiment_score = EXCLUDED.avg_sentiment_score,
            positive_keywords   = EXCLUDED.positive_keywords,
            negative_keywords   = EXCLUDED.negative_keywords,
            decay_score         = EXCLUDED.decay_score,
            week1_ratio         = EXCLUDED.week1_ratio,
            month1_ratio        = EXCLUDED.month1_ratio,
            total_analyzed      = EXCLUDED.total_analyzed,
            updated_at          = NOW()
    """), {
        "game_id": req.game_id,
        "steam_count": steam_count,
        "avg_score": avg_score,
        "pos_kws": json.dumps(pos_kws, ensure_ascii=False),
        "neg_kws": json.dumps(neg_kws, ensure_ascii=False),
        "decay_score": decay["decay_score"],
        "week1_ratio": decay["week1_ratio"],
        "month1_ratio": decay["month1_ratio"],
        "total_analyzed": decay["total_analyzed"],
    })

    db.commit()
    return {"status": "ok", "count": len(reviews)}


@app.post("/signals/fetch")
def fetch_signals(req: SignalFetchRequest, db: Session = Depends(get_db)):
    signals = fetch_youtube_signals(req.game_name)
    if not signals:
        return {"status": "no_signals", "count": 0}

    for s in signals:
        published_at = None
        if s.get("published_at"):
            try:
                published_at = datetime.fromisoformat(s["published_at"].replace("Z", "+00:00"))
            except ValueError:
                pass

        db.execute(text("""
            INSERT INTO game_signals (game_id, source_type, source_id, url, title, author, engagement_count, collected_at)
            VALUES (:game_id, 'YOUTUBE', :source_id, :url, :title, :author, :engagement_count, :collected_at)
            ON CONFLICT (source_type, source_id) DO NOTHING
        """), {
            "game_id": req.game_id,
            "source_id": s["source_id"],
            "url": s["url"],
            "title": s["title"],
            "author": s["author"],
            "engagement_count": s["engagement_count"],
            "collected_at": published_at,
        })

    yt_count = db.execute(
        text("SELECT COUNT(*) FROM game_signals WHERE game_id = :gid AND source_type = 'YOUTUBE'"),
        {"gid": req.game_id}
    ).scalar()

    db.execute(text("""
        INSERT INTO game_metrics (game_id, youtube_signal_count, updated_at)
        VALUES (:game_id, :yt_count, NOW())
        ON CONFLICT (game_id) DO UPDATE SET
            youtube_signal_count = EXCLUDED.youtube_signal_count,
            updated_at           = NOW()
    """), {
        "game_id": req.game_id,
        "yt_count": yt_count,
    })

    db.commit()
    return {"status": "ok", "count": len(signals)}


def extract_intent(query: str) -> str:
    query_lower = query.lower()
    intents = []
    if any(w in query_lower for w in ["추천", "recommend", "좋은", "재미"]):
        intents.append("recommend")
    if any(w in query_lower for w in ["분석", "통계", "얼마나", "몇명"]):
        intents.append("analyze")
    if any(w in query_lower for w in ["리뷰", "평가", "review", "평점"]):
        intents.append("review")
    if any(w in query_lower for w in ["개발", "만들", "개발자", "도구"]):
        intents.append("development")
    return ",".join(intents) if intents else "general"
