package com.oms.user;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .username("creator1")
                    .password(passwordEncoder.encode("password"))
                    .role(UserRole.CREATOR)
                    .build());
            userRepository.save(User.builder()
                    .username("purchaser1")
                    .password(passwordEncoder.encode("password"))
                    .role(UserRole.PURCHASER)
                    .build());
        }
    }
}
