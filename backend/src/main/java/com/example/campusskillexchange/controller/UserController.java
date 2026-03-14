package com.example.campusskillexchange.controller;

import com.example.campusskillexchange.entity.LearningSession;
import com.example.campusskillexchange.entity.SkillMatch;
import com.example.campusskillexchange.entity.User;
import com.example.campusskillexchange.repository.LearningSessionRepository;
import com.example.campusskillexchange.repository.SkillMatchRepository;
import com.example.campusskillexchange.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private LearningSessionRepository sessionRepository;

    @Autowired
    private SkillMatchRepository matchRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> payload) {
        try {
            User user = userService.registerUser(
                payload.get("username"),
                payload.get("email"),
                payload.get("password"),
                payload.get("linkedinUrl")
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> payload) {
        try {
            User user = userService.loginUser(payload.get("username"), payload.get("password"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Full profile: user info + skills + matches + sessions */
    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getFullProfile(@PathVariable Long id) {
        return userService.getUserById(id).map(user -> {
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("email", user.getEmail());
            profile.put("linkedinUrl", user.getLinkedinUrl());
            profile.put("skillsToTeach", user.getSkillsToTeach());
            profile.put("skillsToLearn", user.getSkillsToLearn());

            // Sessions hosted by this user
            List<LearningSession> hosted = sessionRepository.findByIsGroupTrue().stream()
                .filter(s -> s.getHostUser().getId().equals(id))
                .collect(Collectors.toList());
            profile.put("sessionsHosted", hosted);

            // Sessions user is attending (participant but not host)
            List<LearningSession> attending = sessionRepository.findByIsGroupTrue().stream()
                .filter(s -> !s.getHostUser().getId().equals(id) &&
                    s.getParticipantUsers().stream().anyMatch(p -> p.getId().equals(id)))
                .collect(Collectors.toList());
            profile.put("sessionsAttending", attending);

            // Accepted matches
            List<SkillMatch> matches = matchRepository.findAllForUser(id).stream()
                .filter(m -> "ACCEPTED".equals(m.getStatus()))
                .collect(Collectors.toList());
            profile.put("acceptedMatches", matches.size());
            profile.put("matches", matches);

            return ResponseEntity.ok(profile);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/{id}/skills/teach")
    public ResponseEntity<?> addSkillToTeach(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            User user = userService.addSkillToTeach(id, payload.get("skillName"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/skills/learn")
    public ResponseEntity<?> addSkillToLearn(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            User user = userService.addSkillToLearn(id, payload.get("skillName"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
