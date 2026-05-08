package com.gweb2.domain.analysis.dto;

import com.gweb2.domain.analysis.entity.UserQuery;

import java.time.LocalDateTime;

public record QueryResponse(
        Long queryId,
        String answer,
        String status,
        long processingMs,
        LocalDateTime completedAt
) {
    public static QueryResponse from(UserQuery q) {
        return new QueryResponse(
                q.getId(),
                q.getLlmResponse(),
                q.getStatus().name(),
                q.getProcessingMs() != null ? q.getProcessingMs() : 0,
                q.getCompletedAt()
        );
    }
}
