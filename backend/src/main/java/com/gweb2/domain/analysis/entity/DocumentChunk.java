package com.gweb2.domain.analysis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * document_chunks 카테고리 - 게임 설명/리뷰 등 텍스트 청크 (벡터 검색용)
 */
@Entity
@Table(name = "document_chunks", indexes = {
        @Index(name = "idx_doc_chunks_game_id", columnList = "game_id"),
        @Index(name = "idx_doc_chunks_chunk_type", columnList = "chunk_type")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "game_id")
    private Long gameId;

    @Enumerated(EnumType.STRING)
    @Column(name = "chunk_type", nullable = false, length = 30)
    private ChunkType chunkType;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Transient
    private float[] embedding;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ChunkType {
        GAME_DESCRIPTION, GAME_REVIEW, GAME_TAG_SUMMARY, SIGNAL_CONTENT
    }
}
