package com.gweb2.domain.analysis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QueryRequest(
        @NotBlank @Size(max = 1000) String query,
        String sessionId
) {}
