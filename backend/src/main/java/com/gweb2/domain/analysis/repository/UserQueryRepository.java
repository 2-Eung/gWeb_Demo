package com.gweb2.domain.analysis.repository;

import com.gweb2.domain.analysis.entity.UserQuery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserQueryRepository extends JpaRepository<UserQuery, Long> {

    List<UserQuery> findBySessionIdOrderByCreatedAtDesc(String sessionId);
}
