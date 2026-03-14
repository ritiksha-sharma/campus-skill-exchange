package com.example.campusskillexchange.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "skill_matches")
public class SkillMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_taught_by_user1_id")
    private Skill skillTaughtByUser1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_taught_by_user2_id")
    private Skill skillTaughtByUser2;

    /**
     * Status values:
     *   SUGGESTED           – newly found, neither user has accepted
     *   PENDING_BOTH_ACCEPT – one user accepted, waiting for the other
     *   ACCEPTED            – both users accepted, contact details revealed
     */
    private String status;

    /** Whether user1 has clicked "Accept Match" */
    @Column(name = "accepted_by_user1", nullable = false)
    private boolean user1Accepted = false;

    /** Whether user2 has clicked "Accept Match" */
    @Column(name = "accepted_by_user2", nullable = false)
    private boolean user2Accepted = false;

    public SkillMatch() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser1() { return user1; }
    public void setUser1(User user1) { this.user1 = user1; }
    public User getUser2() { return user2; }
    public void setUser2(User user2) { this.user2 = user2; }
    public Skill getSkillTaughtByUser1() { return skillTaughtByUser1; }
    public void setSkillTaughtByUser1(Skill skillTaughtByUser1) { this.skillTaughtByUser1 = skillTaughtByUser1; }
    public Skill getSkillTaughtByUser2() { return skillTaughtByUser2; }
    public void setSkillTaughtByUser2(Skill skillTaughtByUser2) { this.skillTaughtByUser2 = skillTaughtByUser2; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isUser1Accepted() { return user1Accepted; }
    public void setUser1Accepted(boolean user1Accepted) { this.user1Accepted = user1Accepted; }
    public boolean isUser2Accepted() { return user2Accepted; }
    public void setUser2Accepted(boolean user2Accepted) { this.user2Accepted = user2Accepted; }
}

