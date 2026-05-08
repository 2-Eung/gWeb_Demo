package com.gweb2.domain.analysis.repository;

import com.gweb2.domain.analysis.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    // pgvector 코사인 유사도 검색
    @Query(value = """
            SELECT * FROM document_chunks
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
            """, nativeQuery = true)
    List<DocumentChunk> findSimilarChunks(@Param("embedding") String embedding, @Param("limit") int limit);

    void deleteByGameId(Long gameId);
}
