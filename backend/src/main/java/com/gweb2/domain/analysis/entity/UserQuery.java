package com.gweb2.domain.analysis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * context 카테고리 - 사용자 질의 및 처리 결과 이력
 */
@Entity
@Table(name = "user_queries", indexes = {
        @Index(name = "idx_user_queries_created_at", columnList = "created_at"),
        @Index(name = "idx_user_queries_session_id", columnList = "session_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class UserQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "query_text", nullable = false, columnDefinition = "TEXT")
    private String queryText;

    @Transient
    private float[] queryEmbedding;

    // Python 분석 결과
    @Column(name = "extracted_intent", columnDefinition = "TEXT")
    private String extractedIntent; // Python 의미 추출 결과 JSON

    @Column(name = "matched_game_ids", columnDefinition = "TEXT")
    private String matchedGameIds; // 매칭된 game id 목록 JSON

    // LLM 결과
    @Column(name = "llm_response", columnDefinition = "TEXT")
    private String llmResponse;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private QueryStatus status = QueryStatus.PENDING;

    @Column(name = "processing_ms")
    private Long processingMs; // 전체 처리 시간

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public void complete(String llmResponse, long processingMs) {
        this.llmResponse = llmResponse;
        this.processingMs = processingMs;
        this.status = QueryStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void setAnalysisResult(float[] embedding, String intent, String gameIds) {
        this.queryEmbedding = embedding;
        this.extractedIntent = intent;
        this.matchedGameIds = gameIds;
        this.status = QueryStatus.ANALYZED;
    }

    public enum QueryStatus {
        PENDING, ANALYZED, COMPLETED, FAILED
    }
}
