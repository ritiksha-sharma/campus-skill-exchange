package com.example.campusskillexchange.controller;

import com.example.campusskillexchange.entity.LearningSession;
import com.example.campusskillexchange.entity.SessionJoinRequest;
import com.example.campusskillexchange.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    /** Create a session */
    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> payload) {
        try {
            Long hostId = Long.valueOf(payload.get("hostId").toString());
            String topic = (String) payload.get("topic");
            String description = (String) payload.get("description");
            String dateTimeStr = (String) payload.get("dateTime");
            boolean isGroup = Boolean.parseBoolean(payload.getOrDefault("isGroup", "true").toString());
            Integer maxParticipants = payload.get("maxParticipants") != null
                ? Integer.valueOf(payload.get("maxParticipants").toString()) : null;

            LearningSession session = sessionService.createSession(
                hostId, topic, description, LocalDateTime.parse(dateTimeStr), isGroup, maxParticipants
            );
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** List all group sessions */
    @GetMapping
    public List<LearningSession> getAllSessions() {
        return sessionService.getAllGroupSessions();
    }

    /** Get a single session */
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable Long sessionId) {
        try {
            return ResponseEntity.ok(sessionService.getSessionById(sessionId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Student requests to join */
    @PostMapping("/{sessionId}/request-join")
    public ResponseEntity<?> requestJoin(@PathVariable Long sessionId, @RequestBody Map<String, Long> payload) {
        try {
            SessionJoinRequest req = sessionService.requestJoin(sessionId, payload.get("userId"));
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Host fetches pending join requests for their session */
    @GetMapping("/{sessionId}/join-requests")
    public ResponseEntity<?> getJoinRequests(@PathVariable Long sessionId) {
        try {
            return ResponseEntity.ok(sessionService.getPendingRequestsForSession(sessionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Get all join requests (any status) for a session */
    @GetMapping("/{sessionId}/join-requests/all")
    public ResponseEntity<?> getAllJoinRequests(@PathVariable Long sessionId) {
        try {
            return ResponseEntity.ok(sessionService.getAllRequestsForSession(sessionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Host accepts or declines a join request */
    @PostMapping("/join-requests/{requestId}/respond")
    public ResponseEntity<?> respondToRequest(@PathVariable Long requestId, @RequestBody Map<String, Object> payload) {
        try {
            Long hostId = Long.valueOf(payload.get("hostId").toString());
            boolean accept = Boolean.parseBoolean(payload.get("accept").toString());
            SessionJoinRequest result = sessionService.respondToJoinRequest(requestId, hostId, accept);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Get all join requests made by a user (to see their request statuses) */
    @GetMapping("/my-requests/{userId}")
    public ResponseEntity<?> getMyRequests(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(sessionService.getRequestsByUser(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Host sends a notification message to all accepted participants */
    @PostMapping("/{sessionId}/notify-participants")
    public ResponseEntity<?> notifyParticipants(@PathVariable Long sessionId,
                                                 @RequestBody Map<String, Object> payload) {
        try {
            Long hostId = Long.valueOf(payload.get("hostId").toString());
            String message = (String) payload.get("message");
            sessionService.notifyParticipants(sessionId, hostId, message);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

