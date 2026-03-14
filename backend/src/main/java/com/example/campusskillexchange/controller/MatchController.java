package com.example.campusskillexchange.controller;

import com.example.campusskillexchange.entity.SkillMatch;
import com.example.campusskillexchange.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "*")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getMatchesForUser(@PathVariable Long userId) {
        try {
            List<SkillMatch> matches = matchService.findMatchesForUser(userId);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{matchId}/accept")
    public ResponseEntity<?> acceptMatch(@PathVariable Long matchId, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            SkillMatch match = matchService.acceptMatch(matchId, userId);
            return ResponseEntity.ok(match);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
