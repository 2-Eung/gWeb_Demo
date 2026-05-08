package com.gweb2.domain.analysis.controller;

import com.gweb2.domain.analysis.dto.QueryRequest;
import com.gweb2.domain.analysis.dto.QueryResponse;
import com.gweb2.domain.analysis.service.QueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/query")
@RequiredArgsConstructor
public class QueryController {

    private final QueryService queryService;

    @PostMapping
    public ResponseEntity<QueryResponse> query(@Valid @RequestBody QueryRequest request) {
        var result = queryService.process(request.query(), request.sessionId());
        return ResponseEntity.ok(QueryResponse.from(result));
    }
}
