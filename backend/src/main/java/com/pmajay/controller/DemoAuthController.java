package com.pmajay.controller;

import com.pmajay.dto.AuthResponse;
import com.pmajay.model.User;
import com.pmajay.repository.UserRepository;
import com.pmajay.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Provides a password-free demo login endpoint that is ONLY active when
 * demo.mode.enabled=true (set via environment variable, never in production).
 *
 * Usage: POST /api/auth/demo  { "role": "CENTRE" | "STATE" | "AGENCY" }
 *
 * Returns the same AuthResponse as a normal login, granting a full-day JWT
 * scoped to the first seeded user with the requested role.
 */
@RestController
@RequestMapping("/api/auth")
public class DemoAuthController {

    @Value("${demo.mode.enabled:false}")
    private boolean demoModeEnabled;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/demo")
    public ResponseEntity<?> demoLogin(@RequestBody Map<String, String> body) {
        // Hard gate: if demo mode is off, treat this endpoint as non-existent.
        if (!demoModeEnabled) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Demo mode is not enabled"));
        }

        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "role is required (CENTRE | STATE | AGENCY)"));
        }

        User.Role role;
        try {
            role = User.Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid role. Must be CENTRE, STATE, or AGENCY"));
        }

        // Find the first seeded demo user for that role
        User user = userRepository.findFirstByRole(role)
                .orElseGet(() -> userRepository.findByRole(role)
                        .stream().findFirst()
                        .orElse(null));

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No demo user found for role: " + role));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .stateId(user.getStateId())
                .agencyId(user.getAgencyId())
                .build());
    }
}
