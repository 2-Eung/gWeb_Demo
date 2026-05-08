package com.gweb2.domain.game.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * signals 카테고리 - YouTube/Twitch/커뮤니티 반응 데이터 (추후 개발)
 */
@Entity
@Table(name = "game_signals", indexes = {
        @Index(name = "idx_game_signals_game_id", columnList = "game_id"),
        @Index(name = "idx_game_signals_source_type", columnList = "source_type, collected_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class GameSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private SourceType sourceType;

    @Column(name = "source_id", length = 300) // 영상 ID, 트윗 ID 등
    private String sourceId;

    @Column(name = "url", length = 2000)
    private String url;

    @Column(name = "title", length = 1000)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "author", length = 300)
    private String author;

    @Column(name = "sentiment_score") // -1.0 ~ 1.0
    private Double sentimentScore;

    @Column(name = "engagement_count") // 조회수/좋아요/댓글 등 참여수
    private Long engagementCount;

    @Column(name = "collected_at")
    private LocalDateTime collectedAt;

    public enum SourceType {
        YOUTUBE, TWITCH, REDDIT, STEAM_REVIEW, COMMUNITY
    }
}
