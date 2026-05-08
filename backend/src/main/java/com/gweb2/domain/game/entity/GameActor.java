package com.gweb2.domain.game.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * actors 카테고리 - 개발사, 퍼블리셔
 */
@Entity
@Table(name = "game_actors", indexes = {
        @Index(name = "idx_game_actors_game_id", columnList = "game_id"),
        @Index(name = "idx_game_actors_name_trgm", columnList = "actor_name")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class GameActor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "actor_name", nullable = false, length = 300)
    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_type", nullable = false, length = 20)
    private ActorType actorType;

    public enum ActorType {
        DEVELOPER, PUBLISHER
    }
}
