package com.example.campusskillexchange.service;

import com.example.campusskillexchange.entity.LearningSession;
import com.example.campusskillexchange.entity.SessionJoinRequest;
import com.example.campusskillexchange.entity.User;
import com.example.campusskillexchange.repository.LearningSessionRepository;
import com.example.campusskillexchange.repository.SessionJoinRequestRepository;
import com.example.campusskillexchange.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionService {

    @Autowired
    private LearningSessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionJoinRequestRepository joinRequestRepository;

    @Autowired
    private NotificationService notificationService;

    public LearningSession createSession(Long hostId, String topic, String description,
                                         LocalDateTime dateTime, boolean isGroup, Integer maxParticipants) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new IllegalArgumentException("Host user not found"));

        LearningSession session = new LearningSession();
        session.setHostUser(host);
        session.setTopic(topic);
        session.setDescription(description);
        session.setDateTime(dateTime);
        session.setIsGroup(isGroup);
        session.setMaxParticipants(maxParticipants);
        return sessionRepository.save(session);
    }

    public List<LearningSession> getAllGroupSessions() {
        return sessionRepository.findByIsGroupTrue();
    }

    public LearningSession getSessionById(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
    }

    /** Student requests to join — creates a PENDING join request and notifies the host */
    @Transactional
    public SessionJoinRequest requestJoin(Long sessionId, Long userId) {
        LearningSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if already requested
        joinRequestRepository.findBySessionIdAndRequesterId(sessionId, userId)
                .ifPresent(r -> { throw new IllegalArgumentException("Already requested to join"); });

        // Check host is not requesting their own session
        if (session.getHostUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Host cannot join their own session");
        }

        // Check max participants
        if (session.getMaxParticipants() != null &&
            session.getParticipantUsers().size() >= session.getMaxParticipants()) {
            throw new IllegalArgumentException("Session is full");
        }

        SessionJoinRequest request = new SessionJoinRequest(session, user);
        SessionJoinRequest saved = joinRequestRepository.save(request);

        // Notify host
        notificationService.createNotification(
            session.getHostUser().getId(),
            "📩 " + user.getUsername() + " wants to join your session: \"" + session.getTopic() + "\"",
            "SESSION_REMINDER"
        );

        return saved;
    }

    /** Host responds to a join request — accept or decline */
    @Transactional
    public SessionJoinRequest respondToJoinRequest(Long requestId, Long hostId, boolean accept) {
        SessionJoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        LearningSession session = request.getSession();
        if (!session.getHostUser().getId().equals(hostId)) {
            throw new IllegalArgumentException("Only the host can respond to requests");
        }

        User requester = request.getRequester();

        if (accept) {
            // Check again in case session filled up between request and accept
            if (session.getMaxParticipants() != null &&
                session.getParticipantUsers().size() >= session.getMaxParticipants()) {
                throw new IllegalArgumentException("Session is already full");
            }
            request.setStatus("ACCEPTED");
            session.getParticipantUsers().add(requester);
            sessionRepository.save(session);

            // Notify student with host contact info
            User host = session.getHostUser();
            String hostContact = "Email: " + host.getEmail() +
                (host.getLinkedinUrl() != null && !host.getLinkedinUrl().isEmpty()
                    ? " | LinkedIn: " + host.getLinkedinUrl() : "");
            notificationService.createNotification(
                requester.getId(),
                "✅ Your request to join \"" + session.getTopic() + "\" was accepted! Host contact: " + hostContact,
                "SESSION_REMINDER"
            );
        } else {
            request.setStatus("DECLINED");
            notificationService.createNotification(
                requester.getId(),
                "😔 Sorry, your request to join \"" + session.getTopic() + "\" was not accepted this time. Keep learning!",
                "SESSION_REMINDER"
            );
        }

        return joinRequestRepository.save(request);
    }

    public List<SessionJoinRequest> getPendingRequestsForSession(Long sessionId) {
        return joinRequestRepository.findBySessionIdAndStatus(sessionId, "PENDING");
    }

    public List<SessionJoinRequest> getAllRequestsForSession(Long sessionId) {
        return joinRequestRepository.findBySessionId(sessionId);
    }

    public List<SessionJoinRequest> getRequestsByUser(Long userId) {
        return joinRequestRepository.findByRequesterId(userId);
    }

    /** Host broadcasts a notification message to all accepted participants */
    @Transactional
    public void notifyParticipants(Long sessionId, Long hostId, String message) {
        LearningSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (!session.getHostUser().getId().equals(hostId)) {
            throw new IllegalArgumentException("Only the host can send notifications");
        }
        String fullMsg = "📢 [" + session.getTopic() + "] " + message;
        for (User participant : session.getParticipantUsers()) {
            notificationService.createNotification(participant.getId(), fullMsg, "SESSION_REMINDER");
        }
    }
}

