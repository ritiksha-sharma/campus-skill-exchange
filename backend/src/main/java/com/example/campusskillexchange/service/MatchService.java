package com.example.campusskillexchange.service;

import com.example.campusskillexchange.entity.Skill;
import com.example.campusskillexchange.entity.SkillMatch;
import com.example.campusskillexchange.entity.User;
import com.example.campusskillexchange.repository.SkillMatchRepository;
import com.example.campusskillexchange.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MatchService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillMatchRepository matchRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void cleanupBadColumns() {
        try {
            jdbcTemplate.execute("ALTER TABLE skill_matches DROP COLUMN user1accepted");
            jdbcTemplate.execute("ALTER TABLE skill_matches DROP COLUMN user2accepted");
            System.out.println("Cleaned up bad columns from skill_matches");
        } catch (Exception e) {
            System.out.println("Could not drop columns (they might not exist): " + e.getMessage());
        }
    }

    public List<SkillMatch> findMatchesForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<User> allUsers = userRepository.findAll();
        List<SkillMatch> result = new ArrayList<>();

        for (User other : allUsers) {
            if (other.getId().equals(user.getId())) continue;

            // Case-insensitive skill matching
            Skill learnMatch = null;
            for (Skill wantToLearn : user.getSkillsToLearn()) {
                if (other.getSkillsToTeach().stream()
                        .anyMatch(s -> s.getName().equalsIgnoreCase(wantToLearn.getName()))) {
                    learnMatch = wantToLearn;
                    break;
                }
            }

            Skill teachMatch = null;
            for (Skill canTeach : user.getSkillsToTeach()) {
                if (other.getSkillsToLearn().stream()
                        .anyMatch(s -> s.getName().equalsIgnoreCase(canTeach.getName()))) {
                    teachMatch = canTeach;
                    break;
                }
            }

            if (learnMatch != null && teachMatch != null) {
                // Check if this match pair already exists
                List<SkillMatch> existing = matchRepository.findMatchBetweenUsers(user.getId(), other.getId());
                boolean alreadyExists = !existing.isEmpty();

                if (!alreadyExists) {
                    SkillMatch match = new SkillMatch();
                    match.setUser1(user);
                    match.setUser2(other);
                    match.setSkillTaughtByUser1(teachMatch);
                    match.setSkillTaughtByUser2(learnMatch);
                    match.setStatus("SUGGESTED");
                    match.setUser1Accepted(false);
                    match.setUser2Accepted(false);
                    SkillMatch saved = matchRepository.save(match);

                    // Notify both users
                    notificationService.createNotification(user.getId(),
                        "🎯 New match found with " + other.getUsername() + "! They can teach you " + learnMatch.getName() + ".",
                        "MATCH_FOUND");
                    notificationService.createNotification(other.getId(),
                        "🎯 New match found with " + user.getUsername() + "! They can teach you " + teachMatch.getName() + ".",
                        "MATCH_FOUND");

                    result.add(saved);
                }
            }
        }
        
        // After evaluating all users, fetch only the deduplicated master list from DB
        return matchRepository.findAllForUser(userId);
    }

    /**
     * Called when a user clicks "Accept Match".
     * Records their acceptance. Only when BOTH users have accepted does the status
     * change to ACCEPTED and contact details are shared via notifications.
     */
    public SkillMatch acceptMatch(Long matchId, Long userId) {
        SkillMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        boolean isUser1 = match.getUser1().getId().equals(userId);
        boolean isUser2 = match.getUser2().getId().equals(userId);

        if (!isUser1 && !isUser2) {
            throw new IllegalArgumentException("User is not part of this match");
        }

        if (isUser1) {
            match.setUser1Accepted(true);
        } else {
            match.setUser2Accepted(true);
        }

        if (match.isUser1Accepted() && match.isUser2Accepted()) {
            // Both accepted — reveal contact details
            match.setStatus("ACCEPTED");
            SkillMatch saved = matchRepository.save(match);

            User user1 = match.getUser1();
            User user2 = match.getUser2();

            try {
                notificationService.createNotification(user1.getId(),
                    user2.getUsername() + " also accepted! Contact: " + buildContactString(user2),
                    "MATCH_ACCEPTED");
                notificationService.createNotification(user2.getId(),
                    user1.getUsername() + " also accepted! Contact: " + buildContactString(user1),
                    "MATCH_ACCEPTED");
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }

            return saved;
        } else {
            // One accepted — change status to pending and notify the other
            match.setStatus("PENDING_BOTH_ACCEPT");
            SkillMatch saved = matchRepository.save(match);

            // Notify the other user that this user has accepted, prompting them to also accept
            Long otherUserId = isUser1 ? match.getUser2().getId() : match.getUser1().getId();
            String accepterName = isUser1 ? match.getUser1().getUsername() : match.getUser2().getUsername();
            try {
                notificationService.createNotification(otherUserId,
                    accepterName + " accepted the match! Log in and accept to share contact details.",
                    "MATCH_FOUND");
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }

            return saved;
        }
    }

    private String buildContactString(User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("Email: ").append(user.getEmail());
        if (user.getLinkedinUrl() != null && !user.getLinkedinUrl().isEmpty()) {
            sb.append(" | LinkedIn: ").append(user.getLinkedinUrl());
        }
        return sb.toString();
    }
}

