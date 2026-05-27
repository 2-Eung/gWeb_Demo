package com.gweb2.domain.game.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record GameUpdateRequest(
        @NotBlank String name,
        String shortDescription,
        Integer priceInitial,
        Integer priceFinal,
        List<String> genres
) {}
