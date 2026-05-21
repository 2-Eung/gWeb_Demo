-- game_metrics (게임별 시그널 집계 지표)
CREATE TABLE game_metrics (
    id                   BIGSERIAL PRIMARY KEY,
    game_id              BIGINT           NOT NULL UNIQUE REFERENCES games(id) ON DELETE CASCADE,
    steam_review_count   INTEGER          NOT NULL DEFAULT 0,
    youtube_signal_count INTEGER          NOT NULL DEFAULT 0,
    avg_sentiment_score  DOUBLE PRECISION,
    positive_keywords    TEXT,
    negative_keywords    TEXT,
    decay_score          DOUBLE PRECISION,
    week1_ratio          DOUBLE PRECISION,
    month1_ratio         DOUBLE PRECISION,
    total_analyzed       INTEGER          NOT NULL DEFAULT 0,
    updated_at           TIMESTAMP        NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_game_metrics_game_id ON game_metrics (game_id);
CREATE INDEX idx_game_metrics_decay   ON game_metrics (decay_score);

-- game_signals 중복 방지 (source_type + source_id 조합 유니크)
ALTER TABLE game_signals
    ADD CONSTRAINT uq_game_signals_source UNIQUE (source_type, source_id);
