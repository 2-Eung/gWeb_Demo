package com.gweb2.domain.game.service;

import com.gweb2.domain.game.dto.GameUpdateRequest;
import com.gweb2.domain.game.entity.Game;
import com.gweb2.domain.game.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameDataService {

    private final GameRepository gameRepository;
    private final RestClient restClient;

    @Value("${python.api-url:http://localhost:8000}")
    private String pythonApiUrl;

    public Game requestDataFetch(Long appId) {
        log.info("Requesting Python to fetch/sync game appId={}", appId);
        try {
            Map<?, ?> response = restClient.post()
                    .uri(pythonApiUrl + "/fetch")
                    .body(Map.of("app_id", appId))
                    .retrieve()
                    .body(Map.class);
            log.info("Python fetch response: {}", response);
        } catch (RestClientException e) {
            log.error("Python server call failed for appId={}: {}", appId, e.getMessage());
            throw new IllegalStateException("Python 서버 호출 실패: " + e.getMessage(), e);
        }

        return gameRepository.findBySteamAppId(appId)
                .orElseThrow(() -> new IllegalStateException("Game not found after fetch: " + appId));
    }

    public Game updateGame(Long steamAppId, GameUpdateRequest request) {
        log.info("Requesting Python to update game steamAppId={}", steamAppId);
        try {
            Map<String, Object> body = Map.of(
                    "name", request.name(),
                    "short_description", request.shortDescription() != null ? request.shortDescription() : "",
                    "price_initial", request.priceInitial(),
                    "price_final", request.priceFinal(),
                    "genres", request.genres() != null ? request.genres() : List.of()
            );
            restClient.put()
                    .uri(pythonApiUrl + "/games/" + steamAppId)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.error("Failed to update game {} via Python: {}", steamAppId, e.getMessage());
            throw new IllegalStateException("Python 서버를 통한 게임 정보 수정 실패: " + e.getMessage(), e);
        }

        return gameRepository.findBySteamAppId(steamAppId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + steamAppId));
    }

    @Transactional
    public void deleteGame(Long steamAppId) {
        log.info("Deleting game steamAppId={}", steamAppId);
        Game game = gameRepository.findBySteamAppId(steamAppId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + steamAppId));
        gameRepository.delete(game);
    }

    @Transactional(readOnly = true)
    public List<Game> searchByName(String keyword) {
        return gameRepository.findByNameSimilarity(keyword, 10);
    }

    @Transactional(readOnly = true)
    public Game getGame(Long steamAppId) {
        return gameRepository.findBySteamAppId(steamAppId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + steamAppId));
    }

    @Transactional(readOnly = true)
    public Page<Game> getGames(Pageable pageable) {
        return gameRepository.findAll(pageable);
    }
}

