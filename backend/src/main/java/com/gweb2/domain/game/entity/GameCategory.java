package com.gweb2.domain.game.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * catalog 카테고리 - Steam 카테고리 (멀티플레이, 싱글플레이, 컨트롤러지원 등)
 */
@Entity
@Table(name = "game_categories", indexes = {
        @Index(name = "idx_game_categories_game_id", columnList = "game_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class GameCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Column(name = "category_name", nullable = false, length = 200)
    private String categoryName;
}
