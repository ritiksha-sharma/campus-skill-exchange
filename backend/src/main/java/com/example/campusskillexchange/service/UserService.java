package com.example.campusskillexchange.service;

import com.example.campusskillexchange.entity.Skill;
import com.example.campusskillexchange.entity.User;
import com.example.campusskillexchange.repository.SkillRepository;
import com.example.campusskillexchange.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /** Converts "python" → "Python", "machine learning" → "Machine Learning" */
    private String toTitleCase(String input) {
        if (input == null || input.isBlank()) return input;
        String[] words = input.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) sb.append(word.substring(1).toLowerCase());
        }
        return sb.toString();
    }

    public User registerUser(String username, String email, String password, String linkedinUrl) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = new User(username, email, passwordEncoder.encode(password));
        user.setLinkedinUrl(linkedinUrl);
        return userRepository.save(user);
    }

    public User loginUser(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        return user;
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User addSkillToTeach(Long userId, String skillName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String normalizedName = toTitleCase(skillName);
        Skill skill = skillRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> skillRepository.save(new Skill(normalizedName, "auto-generated")));
        if (!user.getSkillsToTeach().contains(skill)) {
            user.getSkillsToTeach().add(skill);
        }
        return userRepository.save(user);
    }

    @Transactional
    public User addSkillToLearn(Long userId, String skillName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String normalizedName = toTitleCase(skillName);
        Skill skill = skillRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> skillRepository.save(new Skill(normalizedName, "auto-generated")));
        if (!user.getSkillsToLearn().contains(skill)) {
            user.getSkillsToLearn().add(skill);
        }
        return userRepository.save(user);
    }
}

