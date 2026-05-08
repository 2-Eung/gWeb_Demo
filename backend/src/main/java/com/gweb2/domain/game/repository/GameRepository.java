package com.gweb2.domain.game.repository;

import com.gweb2.domain.game.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findBySteamAppId(Long steamAppId);

    boolean existsBySteamAppId(Long steamAppId);

    // pg_trgm 유사도 검색
    @Query(value = """
            SELECT * FROM games
            WHERE similarity(name, :keyword) > 0.2
            ORDER BY similarity(name, :keyword) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Game> findByNameSimilarity(@Param("keyword") String keyword, @Param("limit") int limit);

    // pgvector 코사인 유사도 검색 (임베딩 기반)
    @Query(value = """
            SELECT * FROM games
            ORDER BY desc_embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
            """, nativeQuery = true)
    List<Game> findByDescEmbeddingSimilarity(@Param("embedding") String embedding, @Param("limit") int limit);
}
