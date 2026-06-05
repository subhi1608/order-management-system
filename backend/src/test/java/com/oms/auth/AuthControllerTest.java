package com.oms.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oms.auth.dto.LoginRequest;
import com.oms.user.User;
import com.oms.user.UserRepository;
import com.oms.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        userRepository.save(User.builder()
                .username("testcreator")
                .password(passwordEncoder.encode("testpass"))
                .role(UserRole.CREATOR)
                .build());
    }

    @Test
    void login_returns_jwt_for_valid_credentials() throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest("testcreator", "testpass"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CREATOR"))
                .andExpect(jsonPath("$.username").value("testcreator"));
    }

    @Test
    void login_returns_401_for_wrong_password() throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest("testcreator", "wrongpass"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_returns_401_for_unknown_user() throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest("nobody", "testpass"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }
}
