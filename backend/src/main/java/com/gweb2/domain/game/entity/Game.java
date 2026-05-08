package com.gweb2.domain.game.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * catalog 카테고리 - Steam/IGDB/SteamSpy 통합 게임 기본 정보
 */
@Entity
@Table(name = "games", indexes = {
        @Index(name = "idx_games_steam_appid", columnList = "steam_appid", unique = true),
        @Index(name = "idx_games_name_trgm", columnList = "name")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Steam 기본 정보 ---
    @Column(name = "steam_appid", unique = true, nullable = false)
    private Long steamAppId;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "detailed_description", columnDefinition = "TEXT")
    private String detailedDescription;

    @Column(name = "header_image", length = 1000)
    private String headerImage;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "is_free")
    private Boolean isFree;

    @Column(name = "price_initial")
    private Integer priceInitial; // 원화 기준 최초가격 (원)

    @Column(name = "price_final")
    private Integer priceFinal;

    @Column(name = "metacritic_score")
    private Integer metacriticScore;

    @Column(name = "website", length = 1000)
    private String website;

    // --- IGDB 연동 ---
    @Column(name = "igdb_id")
    private Long igdbId;

    @Column(name = "igdb_rating")
    private Double igdbRating;

    @Column(name = "igdb_rating_count")
    private Integer igdbRatingCount;

    // --- SteamSpy 통계 ---
    @Column(name = "owners_min")
    private Long ownersMin;

    @Column(name = "owners_max")
    private Long ownersMax;

    @Column(name = "average_playtime_forever")
    private Integer averagePlaytimeForever; // 분

    @Column(name = "median_playtime_forever")
    private Integer medianPlaytimeForever;

    @Column(name = "positive_reviews")
    private Integer positiveReviews;

    @Column(name = "negative_reviews")
    private Integer negativeReviews;

    // --- 벡터 임베딩 (Python이 저장, 네이티브 쿼리로만 사용 — JPA 역직렬화 제외) ---
    @Transient
    private float[] nameEmbedding;

    @Transient
    private float[] descEmbedding;

    // --- 메타 ---
    @Column(name = "data_fetched_at")
    private LocalDateTime dataFetchedAt;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameGenre> genres = new ArrayList<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameTag> tags = new ArrayList<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameCategory> categories = new ArrayList<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameActor> actors = new ArrayList<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameSignal> signals = new ArrayList<>();

    public void updateEmbeddings(float[] nameEmb, float[] descEmb) {
        this.nameEmbedding = nameEmb;
        this.descEmbedding = descEmb;
        this.lastUpdatedAt = LocalDateTime.now();
    }

    public void markFetched() {
        this.dataFetchedAt = LocalDateTime.now();
        this.lastUpdatedAt = LocalDateTime.now();
    }
}
