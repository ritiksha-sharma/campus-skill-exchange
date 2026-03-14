package com.example.campusskillexchange.repository;

import com.example.campusskillexchange.entity.SessionJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionJoinRequestRepository extends JpaRepository<SessionJoinRequest, Long> {
    List<SessionJoinRequest> findBySessionId(Long sessionId);
    List<SessionJoinRequest> findBySessionIdAndStatus(Long sessionId, String status);
    Optional<SessionJoinRequest> findBySessionIdAndRequesterId(Long sessionId, Long requesterId);
    List<SessionJoinRequest> findByRequesterId(Long requesterId);
}
