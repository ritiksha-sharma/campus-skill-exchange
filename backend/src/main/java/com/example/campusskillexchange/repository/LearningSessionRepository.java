package com.example.campusskillexchange.repository;

import com.example.campusskillexchange.entity.LearningSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {
    List<LearningSession> findByIsGroupTrue();
}
