package com.gweb2.domain.game.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * topics 카테고리 - Steam 유저 태그 (SteamSpy tags)
 */
@Entity
@Table(name = "game_tags", indexes = {
        @Index(name = "idx_game_tags_game_id", columnList = "game_id"),
        @Index(name = "idx_game_tags_tag_name_trgm", columnList = "tag_name")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class GameTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "tag_name", nullable = false, length = 200)
    private String tagName;

    @Column(name = "vote_count")
    private Integer voteCount; // SteamSpy 태그 투표수
}
