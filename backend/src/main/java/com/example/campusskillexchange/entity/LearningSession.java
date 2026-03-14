package com.example.campusskillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "learning_sessions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LearningSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String topic;

    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "host_user_id", nullable = false)
    private User hostUser;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "session_participants",
        joinColumns = @JoinColumn(name = "session_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> participantUsers = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false)
    private Boolean isGroup = false;

    // UPCOMING, ONGOING, PAST
    private String status = "UPCOMING";

    // null = unlimited
    private Integer maxParticipants;

    public LearningSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public User getHostUser() { return hostUser; }
    public void setHostUser(User hostUser) { this.hostUser = hostUser; }
    public List<User> getParticipantUsers() { return participantUsers; }
    public void setParticipantUsers(List<User> participantUsers) { this.participantUsers = participantUsers; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public Boolean getIsGroup() { return isGroup; }
    public void setIsGroup(Boolean isGroup) { this.isGroup = isGroup; }
    public String getStatus() { return computeStatus(); }
    public void setStatus(String status) { this.status = status; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    /** Compute status dynamically based on dateTime */
    private String computeStatus() {
        LocalDateTime now = LocalDateTime.now();
        if (dateTime == null) return "UPCOMING";
        if (dateTime.isAfter(now)) return "UPCOMING";
        if (dateTime.plusHours(2).isAfter(now)) return "ONGOING";
        return "PAST";
    }
}
