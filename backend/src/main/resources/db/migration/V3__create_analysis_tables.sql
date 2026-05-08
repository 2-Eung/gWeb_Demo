-- user_queries (사용자 질의 이력)
CREATE TABLE user_queries (
    id              BIGSERIAL PRIMARY KEY,
    session_id      VARCHAR(100),
    query_text      TEXT NOT NULL,
    query_embedding vector(1024),
    extracted_intent TEXT,
    matched_game_ids TEXT,
    llm_response    TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ANALYZED', 'COMPLETED', 'FAILED')),
    processing_ms   BIGINT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMP
);
CREATE INDEX idx_user_queries_created_at ON user_queries (created_at);
CREATE INDEX idx_user_queries_session_id ON user_queries (session_id);
CREATE INDEX idx_user_queries_embedding ON user_queries USING ivfflat (query_embedding vector_cosine_ops) WITH (lists = 50);

-- document_chunks (벡터 검색용 텍스트 청크)
CREATE TABLE document_chunks (
    id         BIGSERIAL PRIMARY KEY,
    game_id    BIGINT REFERENCES games(id) ON DELETE CASCADE,
    chunk_type VARCHAR(30) NOT NULL CHECK (chunk_type IN ('GAME_DESCRIPTION', 'GAME_REVIEW', 'GAME_TAG_SUMMARY', 'SIGNAL_CONTENT')),
    content    TEXT NOT NULL,
    embedding  vector(1024),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_doc_chunks_game_id ON document_chunks (game_id);
CREATE INDEX idx_doc_chunks_chunk_type ON document_chunks (chunk_type);
CREATE INDEX idx_doc_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
