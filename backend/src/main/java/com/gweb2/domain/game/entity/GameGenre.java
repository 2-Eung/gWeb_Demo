package com.gweb2.domain.game.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * topics 카테고리 - 장르 분류
 */
@Entity
@Table(name = "game_genres", indexes = {
        @Index(name = "idx_game_genres_game_id", columnList = "game_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class GameGenre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "genre_id", nullable = false)
    private Integer genreId; // Steam genre id

    @Column(name = "genre_name", nullable = false, length = 100)
    private String genreName;

    @Column(name = "source", length = 20)
    private String source; // "steam" | "igdb"
}
