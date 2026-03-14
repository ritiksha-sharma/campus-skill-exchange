package com.example.campusskillexchange.repository;

import com.example.campusskillexchange.entity.SkillMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillMatchRepository extends JpaRepository<SkillMatch, Long> {
    
    @Query("SELECT m FROM SkillMatch m WHERE m.user1.id = :userId OR m.user2.id = :userId")
    List<SkillMatch> findAllForUser(@Param("userId") Long userId);

    @Query("SELECT m FROM SkillMatch m WHERE (m.user1.id = :id1 AND m.user2.id = :id2) OR (m.user1.id = :id2 AND m.user2.id = :id1)")
    List<SkillMatch> findMatchBetweenUsers(@Param("id1") Long id1, @Param("id2") Long id2);
}
