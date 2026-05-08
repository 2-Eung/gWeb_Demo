-- games 테이블
CREATE TABLE games (
    id                       BIGSERIAL PRIMARY KEY,
    steam_appid              BIGINT      NOT NULL UNIQUE,
    name                     VARCHAR(500) NOT NULL,
    short_description        TEXT,
    detailed_description     TEXT,
    header_image             VARCHAR(1000),
    release_date             DATE,
    is_free                  BOOLEAN,
    price_initial            INTEGER,
    price_final              INTEGER,
    metacritic_score         INTEGER,
    website                  VARCHAR(1000),
    igdb_id                  BIGINT,
    igdb_rating              DOUBLE PRECISION,
    igdb_rating_count        INTEGER,
    owners_min               BIGINT,
    owners_max               BIGINT,
    average_playtime_forever INTEGER,
    median_playtime_forever  INTEGER,
    positive_reviews         INTEGER,
    negative_reviews         INTEGER,
    name_embedding           vector(1024),
    desc_embedding           vector(1024),
    data_fetched_at          TIMESTAMP,
    last_updated_at          TIMESTAMP
);

-- pg_trgm 인덱스 (게임명 유사도 검색)
CREATE INDEX idx_games_name_trgm ON games USING gin (name gin_trgm_ops);
-- pgvector 인덱스 (임베딩 유사도 검색)
CREATE INDEX idx_games_name_embedding ON games USING ivfflat (name_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_games_desc_embedding ON games USING ivfflat (desc_embedding vector_cosine_ops) WITH (lists = 100);

-- game_genres
CREATE TABLE game_genres (
    id          BIGSERIAL PRIMARY KEY,
    game_id     BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    genre_id    INTEGER NOT NULL,
    genre_name  VARCHAR(100) NOT NULL,
    source      VARCHAR(20)
);
CREATE INDEX idx_game_genres_game_id ON game_genres (game_id);

-- game_tags (SteamSpy 유저 태그)
CREATE TABLE game_tags (
    id         BIGSERIAL PRIMARY KEY,
    game_id    BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    tag_name   VARCHAR(200) NOT NULL,
    vote_count INTEGER
);
CREATE INDEX idx_game_tags_game_id ON game_tags (game_id);
CREATE INDEX idx_game_tags_tag_name_trgm ON game_tags USING gin (tag_name gin_trgm_ops);

-- game_categories (Steam 카테고리)
CREATE TABLE game_categories (
    id            BIGSERIAL PRIMARY KEY,
    game_id       BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    category_id   INTEGER NOT NULL,
    category_name VARCHAR(200) NOT NULL
);
CREATE INDEX idx_game_categories_game_id ON game_categories (game_id);

-- game_actors (개발사/퍼블리셔)
CREATE TABLE game_actors (
    id          BIGSERIAL PRIMARY KEY,
    game_id     BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    actor_name  VARCHAR(300) NOT NULL,
    actor_type  VARCHAR(20) NOT NULL CHECK (actor_type IN ('DEVELOPER', 'PUBLISHER'))
);
CREATE INDEX idx_game_actors_game_id ON game_actors (game_id);
CREATE INDEX idx_game_actors_name_trgm ON game_actors USING gin (actor_name gin_trgm_ops);

-- game_signals (추후 YouTube/Twitch/커뮤니티)
CREATE TABLE game_signals (
    id               BIGSERIAL PRIMARY KEY,
    game_id          BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    source_type      VARCHAR(30) NOT NULL CHECK (source_type IN ('YOUTUBE', 'TWITCH', 'REDDIT', 'STEAM_REVIEW', 'COMMUNITY')),
    source_id        VARCHAR(300),
    url              VARCHAR(2000),
    title            VARCHAR(1000),
    content          TEXT,
    author           VARCHAR(300),
    sentiment_score  DOUBLE PRECISION,
    engagement_count BIGINT,
    collected_at     TIMESTAMP
);
CREATE INDEX idx_game_signals_game_id ON game_signals (game_id);
CREATE INDEX idx_game_signals_source_type ON game_signals (source_type, collected_at);
