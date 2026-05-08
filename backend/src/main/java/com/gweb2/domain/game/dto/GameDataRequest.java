package com.gweb2.domain.game.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record GameDataRequest(
        @NotNull @Positive Long appId
) {}
