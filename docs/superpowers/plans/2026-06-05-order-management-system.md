# Order Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Order Management System with a Java Spring Boot backend (port 8085), React + Vite frontend (port 4000), H2 file-mode database, JWT authentication, Creator/Purchaser roles, and a DRAFT → SUBMITTED → APPROVED → COMPLETED order lifecycle with a RETURNED/amend loop.

**Architecture:** Layered Spring Boot monolith (Controller → Service → Repository) with Spring Data JPA for persistence, JJWT for token signing/validation, and Spring Security 6.x for auth. Frontend is a React SPA using React Router 6, axios, and a shared AuthContext for JWT state management.

**Tech Stack:** Java 17, Spring Boot 3.2.x, Spring Security 6.x, JJWT 0.12.3, H2 (file mode), Lombok, JUnit 5, Mockito | React 18, Vite 5, React Router DOM 6, Axios

---

## File Structure

```
inventory-management/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/oms/
│       │   │   ├── OmsApplication.java
│       │   │   ├── config/
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   └── CorsConfig.java
│       │   │   ├── auth/
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── JwtFilter.java
│       │   │   │   ├── JwtUtil.java
│       │   │   │   └── dto/
│       │   │   │       ├── LoginRequest.java
│       │   │   │       ├── LoginResponse.java
│       │   │   │       └── ChangePasswordRequest.java
│       │   │   ├── user/
│       │   │   │   ├── User.java
│       │   │   │   ├── UserRole.java
│       │   │   │   ├── UserRepository.java
│       │   │   │   ├── UserService.java
│       │   │   │   ├── UserController.java
│       │   │   │   ├── DataSeeder.java
│       │   │   │   └── dto/UserDto.java
│       │   │   └── order/
│       │   │       ├── Order.java
│       │   │       ├── OrderItem.java
│       │   │       ├── OrderStatus.java
│       │   │       ├── OrderRepository.java
│       │   │       ├── OrderService.java
│       │   │       ├── OrderController.java
│       │   │       └── dto/
│       │   │           ├── CreateOrderRequest.java
│       │   │           ├── OrderItemRequest.java
│       │   │           ├── OrderResponse.java
│       │   │           ├── OrderItemResponse.java
│       │   │           ├── CompleteOrderRequest.java
│       │   │           └── PurchaserActionRequest.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│           ├── java/com/oms/
│           │   ├── auth/AuthControllerTest.java
│           │   └── order/OrderServiceTest.java
│           └── resources/application.properties
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/axios.js
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── PrivateRoute.jsx
│       │   ├── NavBar.jsx
│       │   └── StatusBadge.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── OrdersPage.jsx
│           ├── OrderDetailPage.jsx
│           ├── CreateOrderPage.jsx
│           ├── EditOrderPage.jsx
│           └── ChangePasswordPage.jsx
└── docs/
    └── superpowers/
        ├── specs/2026-06-05-order-management-design.md
        └── plans/2026-06-05-order-management-system.md
```

---

## Task 1: Backend Project Scaffold

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/com/oms/OmsApplication.java`
- Create: `backend/src/main/resources/application.properties`
- Create: `backend/src/test/resources/application.properties`

- [ ] **Step 1: Create the Maven directory structure**

```
mkdir -p backend/src/main/java/com/oms/config
mkdir -p backend/src/main/java/com/oms/auth/dto
mkdir -p backend/src/main/java/com/oms/user/dto
mkdir -p backend/src/main/java/com/oms/order/dto
mkdir -p backend/src/main/resources
mkdir -p backend/src/test/java/com/oms/auth
mkdir -p backend/src/test/java/com/oms/order
mkdir -p backend/src/test/resources
mkdir -p backend/data
```

- [ ] **Step 2: Write `backend/pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.oms</groupId>
    <artifactId>oms-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>oms-backend</name>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 3: Write `backend/src/main/java/com/oms/OmsApplication.java`**

```java
package com.oms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class OmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(OmsApplication.class, args);
    }
}
```

- [ ] **Step 4: Write `backend/src/main/resources/application.properties`**

```properties
server.port=8085

spring.datasource.url=jdbc:h2:file:./data/oms;AUTO_SERVER=TRUE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.defer-datasource-initialization=true

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=false

jwt.secret=oms-jwt-secret-key-that-is-at-least-32-characters-long
jwt.expiration=86400000
```

- [ ] **Step 5: Write `backend/src/test/resources/application.properties`**

```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.defer-datasource-initialization=true
jwt.secret=test-jwt-secret-key-at-least-32-characters-long
jwt.expiration=3600000
```

- [ ] **Step 6: Verify the project compiles**

```bash
cd backend && mvn compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat: scaffold Spring Boot backend project"
```

---

## Task 2: Domain Entities and Enums

**Files:**
- Create: `backend/src/main/java/com/oms/user/UserRole.java`
- Create: `backend/src/main/java/com/oms/order/OrderStatus.java`
- Create: `backend/src/main/java/com/oms/user/User.java`
- Create: `backend/src/main/java/com/oms/order/Order.java`
- Create: `backend/src/main/java/com/oms/order/OrderItem.java`

- [ ] **Step 1: Write `UserRole.java`**

```java
package com.oms.user;

public enum UserRole {
    CREATOR, PURCHASER
}
```

- [ ] **Step 2: Write `OrderStatus.java`**

```java
package com.oms.order;

public enum OrderStatus {
    DRAFT, SUBMITTED, APPROVED, COMPLETED, REJECTED, RETURNED
}
```

- [ ] **Step 3: Write `User.java`**

```java
package com.oms.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
}
```

- [ ] **Step 4: Write `Order.java`**

```java
package com.oms.order;

import com.oms.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    private LocalDate expiresAt;

    private String purchaserNote;
    private String txnReference;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
```

- [ ] **Step 5: Write `OrderItem.java`**

```java
package com.oms.order;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private Integer quantity;
}
```

- [ ] **Step 6: Verify compile**

```bash
cd backend && mvn compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/oms/
git commit -m "feat: add domain entities User, Order, OrderItem and enums"
```

---

## Task 3: Repositories

**Files:**
- Create: `backend/src/main/java/com/oms/user/UserRepository.java`
- Create: `backend/src/main/java/com/oms/order/OrderRepository.java`

- [ ] **Step 1: Write `UserRepository.java`**

```java
package com.oms.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

- [ ] **Step 2: Write `OrderRepository.java`**

```java
package com.oms.order;

import com.oms.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCreatedBy(User user);

    List<Order> findByStatusIn(List<OrderStatus> statuses);

    @Query("SELECT oi.itemName FROM OrderItem oi " +
           "WHERE oi.order.status IN :statuses AND oi.order.id != :excludeOrderId")
    List<String> findItemNamesInActiveOrders(
            @Param("statuses") List<OrderStatus> statuses,
            @Param("excludeOrderId") Long excludeOrderId);
}
```

- [ ] **Step 3: Verify compile**

```bash
cd backend && mvn compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/oms/
git commit -m "feat: add JPA repositories for User and Order"
```

---

## Task 4: JWT Infrastructure

**Files:**
- Create: `backend/src/main/java/com/oms/auth/JwtUtil.java`
- Create: `backend/src/main/java/com/oms/auth/JwtFilter.java`

- [ ] **Step 1: Write `JwtUtil.java`**

```java
package com.oms.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey())
                .compact();
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}
```

- [ ] **Step 2: Write `JwtFilter.java`**

```java
package com.oms.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response);
    }
}
```

- [ ] **Step 3: Verify compile**

```bash
cd backend && mvn compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/oms/auth/
git commit -m "feat: add JWT utility and filter"
```

---

## Task 5: Security and CORS Configuration

**Files:**
- Create: `backend/src/main/java/com/oms/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/oms/config/CorsConfig.java`

- [ ] **Step 1: Write `CorsConfig.java`**

```java
package com.oms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

- [ ] **Step 2: Write `SecurityConfig.java`**

Note: `JwtFilter` is injected as a method parameter on `filterChain()` (not a class-level field) to avoid a circular dependency: `SecurityConfig → JwtFilter → UserService → PasswordEncoder → SecurityConfig`.

```java
package com.oms.config;

import com.oms.auth.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configure(http))
                .headers(h -> h.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

- [ ] **Step 3: Verify compile**

```bash
cd backend && mvn compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/oms/config/
git commit -m "feat: configure Spring Security with JWT and CORS"
```

---

## Task 6: User Domain — Service, Controller, Seeder

**Files:**
- Create: `backend/src/main/java/com/oms/user/dto/UserDto.java`
- Create: `backend/src/main/java/com/oms/user/UserService.java`
- Create: `backend/src/main/java/com/oms/user/UserController.java`
- Create: `backend/src/main/java/com/oms/user/DataSeeder.java`

- [ ] **Step 1: Write `UserDto.java`**

```java
package com.oms.user.dto;

import com.oms.user.UserRole;

public record UserDto(Long id, String username, UserRole role) {}
```

- [ ] **Step 2: Write `UserService.java`**

```java
package com.oms.user;

import com.oms.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    public UserDto getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new UserDto(user.getId(), user.getUsername(), user.getRole());
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
```

- [ ] **Step 3: Write `UserController.java`**

```java
package com.oms.user;

import com.oms.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }
}
```

- [ ] **Step 4: Write `DataSeeder.java`**

```java
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
```

- [ ] **Step 5: Verify compile**

```bash
cd backend && mvn compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/oms/user/
git commit -m "feat: add user service, controller, and seed data"
```

---

## Task 7: Auth Endpoints (TDD)

**Files:**
- Create: `backend/src/main/java/com/oms/auth/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/oms/auth/dto/LoginResponse.java`
- Create: `backend/src/main/java/com/oms/auth/dto/ChangePasswordRequest.java`
- Create: `backend/src/main/java/com/oms/auth/AuthController.java`
- Create: `backend/src/test/java/com/oms/auth/AuthControllerTest.java`

- [ ] **Step 1: Write the DTOs**

`LoginRequest.java`:
```java
package com.oms.auth.dto;
public record LoginRequest(String username, String password) {}
```

`LoginResponse.java`:
```java
package com.oms.auth.dto;
public record LoginResponse(String token, String role, String username) {}
```

`ChangePasswordRequest.java`:
```java
package com.oms.auth.dto;
public record ChangePasswordRequest(String currentPassword, String newPassword) {}
```

- [ ] **Step 2: Write the failing test `AuthControllerTest.java`**

```java
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
```

- [ ] **Step 3: Run the test to confirm it fails (AuthController does not exist yet)**

```bash
cd backend && mvn test -pl . -Dtest=AuthControllerTest -q 2>&1 | tail -20
```

Expected: FAIL — compilation error or `AuthController` not found.

- [ ] **Step 4: Write `AuthController.java`**

```java
package com.oms.auth;

import com.oms.auth.dto.ChangePasswordRequest;
import com.oms.auth.dto.LoginRequest;
import com.oms.auth.dto.LoginResponse;
import com.oms.user.UserService;
import com.oms.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);
            UserDto profile = userService.getProfile(userDetails.getUsername());
            return ResponseEntity.ok(new LoginResponse(token, profile.role().name(), profile.username()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request,
                                               Authentication authentication) {
        userService.changePassword(authentication.getName(), request.currentPassword(), request.newPassword());
        return ResponseEntity.ok().build();
    }
}
```

- [ ] **Step 5: Run the test and confirm it passes**

```bash
cd backend && mvn test -Dtest=AuthControllerTest -q
```

Expected: `BUILD SUCCESS` — 3 tests PASSED.

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/oms/auth/ backend/src/test/
git commit -m "feat: add auth endpoints with JWT login (TDD)"
```

---

## Task 8: Order DTOs

**Files:**
- Create: `backend/src/main/java/com/oms/order/dto/OrderItemRequest.java`
- Create: `backend/src/main/java/com/oms/order/dto/CreateOrderRequest.java`
- Create: `backend/src/main/java/com/oms/order/dto/OrderItemResponse.java`
- Create: `backend/src/main/java/com/oms/order/dto/OrderResponse.java`
- Create: `backend/src/main/java/com/oms/order/dto/PurchaserActionRequest.java`
- Create: `backend/src/main/java/com/oms/order/dto/CompleteOrderRequest.java`

- [ ] **Step 1: Write the DTOs**

`OrderItemRequest.java`:
```java
package com.oms.order.dto;
public record OrderItemRequest(String itemName, Integer quantity) {}
```

`CreateOrderRequest.java`:
```java
package com.oms.order.dto;

import java.time.LocalDate;
import java.util.List;

public record CreateOrderRequest(String title, LocalDate expiresAt, List<OrderItemRequest> items) {}
```

`OrderItemResponse.java`:
```java
package com.oms.order.dto;
public record OrderItemResponse(Long id, String itemName, Integer quantity) {}
```

`OrderResponse.java`:
```java
package com.oms.order.dto;

import com.oms.order.OrderStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String title,
        OrderStatus status,
        String createdBy,
        LocalDate expiresAt,
        String purchaserNote,
        String txnReference,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OrderItemResponse> items
) {}
```

`PurchaserActionRequest.java`:
```java
package com.oms.order.dto;
public record PurchaserActionRequest(String note) {}
```

`CompleteOrderRequest.java`:
```java
package com.oms.order.dto;
public record CompleteOrderRequest(String txnReference) {}
```

- [ ] **Step 2: Verify compile**

```bash
cd backend && mvn compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/oms/order/dto/
git commit -m "feat: add order request/response DTOs"
```

---

## Task 9: Order Service (TDD)

**Files:**
- Create: `backend/src/main/java/com/oms/order/OrderService.java`
- Create: `backend/src/test/java/com/oms/order/OrderServiceTest.java`

- [ ] **Step 1: Write the failing tests `OrderServiceTest.java`**

```java
package com.oms.order;

import com.oms.order.dto.CreateOrderRequest;
import com.oms.order.dto.OrderItemRequest;
import com.oms.order.dto.OrderResponse;
import com.oms.user.User;
import com.oms.user.UserRepository;
import com.oms.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock UserRepository userRepository;
    @InjectMocks OrderService orderService;

    private User creator;
    private Order draftOrder;

    @BeforeEach
    void setUp() {
        creator = User.builder().id(1L).username("creator1").role(UserRole.CREATOR).build();

        OrderItem item = OrderItem.builder().id(1L).itemName("Pen").quantity(5).build();
        draftOrder = Order.builder()
                .id(10L)
                .title("Test Order")
                .status(OrderStatus.DRAFT)
                .createdBy(creator)
                .expiresAt(LocalDate.now().plusDays(7))
                .items(new ArrayList<>(List.of(item)))
                .build();
        item.setOrder(draftOrder);
    }

    @Test
    void submitOrder_transitions_draft_to_submitted_when_no_conflicts() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.findItemNamesInActiveOrders(any(), eq(10L))).thenReturn(List.of());
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.submitOrder(10L, "creator1");

        assertEquals(OrderStatus.SUBMITTED, result.status());
    }

    @Test
    void submitOrder_throws_409_when_items_conflict_with_active_orders() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.findItemNamesInActiveOrders(any(), eq(10L))).thenReturn(List.of("Pen"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.submitOrder(10L, "creator1"));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("pen"));
    }

    @Test
    void updateOrder_throws_403_when_user_is_not_owner() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));

        CreateOrderRequest req = new CreateOrderRequest("Updated", LocalDate.now().plusDays(10),
                List.of(new OrderItemRequest("Stapler", 2)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.updateOrder(10L, req, "other_user"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void updateOrder_throws_400_when_order_is_not_editable() {
        draftOrder.setStatus(OrderStatus.SUBMITTED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));

        CreateOrderRequest req = new CreateOrderRequest("Updated", LocalDate.now().plusDays(10),
                List.of(new OrderItemRequest("Stapler", 2)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.updateOrder(10L, req, "creator1"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void approveOrder_transitions_submitted_to_approved() {
        draftOrder.setStatus(OrderStatus.SUBMITTED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.approveOrder(10L);

        assertEquals(OrderStatus.APPROVED, result.status());
    }

    @Test
    void completeOrder_sets_txn_reference_and_transitions_to_completed() {
        draftOrder.setStatus(OrderStatus.APPROVED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.completeOrder(10L, "TXN-001");

        assertEquals(OrderStatus.COMPLETED, result.status());
        assertEquals("TXN-001", result.txnReference());
    }

    @Test
    void returnOrder_sets_note_and_transitions_to_returned() {
        draftOrder.setStatus(OrderStatus.SUBMITTED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.returnOrder(10L, "Please add more items");

        assertEquals(OrderStatus.RETURNED, result.status());
        assertEquals("Please add more items", result.purchaserNote());
    }

    @Test
    void rejectOrder_sets_note_and_transitions_to_rejected() {
        draftOrder.setStatus(OrderStatus.SUBMITTED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse result = orderService.rejectOrder(10L, "Budget exceeded");

        assertEquals(OrderStatus.REJECTED, result.status());
        assertEquals("Budget exceeded", result.purchaserNote());
    }

    @Test
    void approveOrder_throws_400_when_order_not_submitted() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(draftOrder));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> orderService.approveOrder(10L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail (OrderService does not exist yet)**

```bash
cd backend && mvn test -Dtest=OrderServiceTest -q 2>&1 | tail -10
```

Expected: FAIL — compilation error.

- [ ] **Step 3: Write `OrderService.java`**

```java
package com.oms.order;

import com.oms.order.dto.*;
import com.oms.user.User;
import com.oms.user.UserRepository;
import com.oms.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private static final List<OrderStatus> BLOCKING_STATUSES =
            List.of(OrderStatus.SUBMITTED, OrderStatus.APPROVED);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderResponse createOrder(CreateOrderRequest request, String username) {
        User creator = findUser(username);
        Order order = Order.builder()
                .title(request.title())
                .status(OrderStatus.DRAFT)
                .createdBy(creator)
                .expiresAt(request.expiresAt())
                .build();
        request.items().stream()
                .map(i -> OrderItem.builder().order(order).itemName(i.itemName()).quantity(i.quantity()).build())
                .forEach(order.getItems()::add);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse updateOrder(Long orderId, CreateOrderRequest request, String username) {
        Order order = getOwnedEditableOrder(orderId, username);
        order.setTitle(request.title());
        order.setExpiresAt(request.expiresAt());
        order.getItems().clear();
        request.items().stream()
                .map(i -> OrderItem.builder().order(order).itemName(i.itemName()).quantity(i.quantity()).build())
                .forEach(order.getItems()::add);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse submitOrder(Long orderId, String username) {
        Order order = getOwnedEditableOrder(orderId, username);
        checkDuplicateItems(order);
        order.setStatus(OrderStatus.SUBMITTED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse approveOrder(Long orderId) {
        Order order = getOrderInStatus(orderId, OrderStatus.SUBMITTED);
        order.setStatus(OrderStatus.APPROVED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse completeOrder(Long orderId, String txnReference) {
        Order order = getOrderInStatus(orderId, OrderStatus.APPROVED);
        order.setTxnReference(txnReference);
        order.setStatus(OrderStatus.COMPLETED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse returnOrder(Long orderId, String note) {
        Order order = getOrderInStatus(orderId, OrderStatus.SUBMITTED);
        order.setPurchaserNote(note);
        order.setStatus(OrderStatus.RETURNED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse rejectOrder(Long orderId, String note) {
        Order order = getOrderInStatus(orderId, OrderStatus.SUBMITTED);
        order.setPurchaserNote(note);
        order.setStatus(OrderStatus.REJECTED);
        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(String username, UserRole role) {
        User user = findUser(username);
        List<Order> orders = role == UserRole.CREATOR
                ? orderRepository.findByCreatedBy(user)
                : orderRepository.findByStatusIn(List.of(
                        OrderStatus.SUBMITTED, OrderStatus.APPROVED, OrderStatus.COMPLETED,
                        OrderStatus.REJECTED, OrderStatus.RETURNED));
        return orders.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId, String username, UserRole role) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (role == UserRole.CREATOR && !order.getCreatedBy().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (role == UserRole.PURCHASER && order.getStatus() == OrderStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return toResponse(order);
    }

    private void checkDuplicateItems(Order order) {
        List<String> activeItemNames = orderRepository.findItemNamesInActiveOrders(BLOCKING_STATUSES, order.getId());
        Set<String> activeNamesLower = activeItemNames.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
        List<String> conflicts = order.getItems().stream()
                .map(i -> i.getItemName().toLowerCase())
                .filter(activeNamesLower::contains)
                .toList();
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Items already in active orders: " + String.join(", ", conflicts));
        }
    }

    private Order getOwnedEditableOrder(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getCreatedBy().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this order");
        }
        if (order.getStatus() != OrderStatus.DRAFT && order.getStatus() != OrderStatus.RETURNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order cannot be edited in status: " + order.getStatus());
        }
        return order;
    }

    private Order getOrderInStatus(Long orderId, OrderStatus expectedStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (order.getStatus() != expectedStatus) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order must be in status " + expectedStatus + " but is " + order.getStatus());
        }
        return order;
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getTitle(),
                order.getStatus(),
                order.getCreatedBy().getUsername(),
                order.getExpiresAt(),
                order.getPurchaserNote(),
                order.getTxnReference(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream()
                        .map(i -> new OrderItemResponse(i.getId(), i.getItemName(), i.getQuantity()))
                        .toList()
        );
    }
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
cd backend && mvn test -Dtest=OrderServiceTest -q
```

Expected: `BUILD SUCCESS` — 8 tests PASSED.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/oms/order/OrderService.java backend/src/test/java/com/oms/order/
git commit -m "feat: implement order service business logic (TDD)"
```

---

## Task 10: Order Controller

**Files:**
- Create: `backend/src/main/java/com/oms/order/OrderController.java`

- [ ] **Step 1: Write `OrderController.java`**

```java
package com.oms.order;

import com.oms.order.dto.*;
import com.oms.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getOrdersForUser(auth.getName(), getRole(auth)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request, auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.getOrder(id, auth.getName(), getRole(auth)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable Long id,
                                                     @RequestBody CreateOrderRequest request,
                                                     Authentication auth) {
        return ResponseEntity.ok(orderService.updateOrder(id, request, auth.getName()));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<OrderResponse> submitOrder(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.submitOrder(id, auth.getName()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('PURCHASER')")
    public ResponseEntity<OrderResponse> approveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.approveOrder(id));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('PURCHASER')")
    public ResponseEntity<OrderResponse> completeOrder(@PathVariable Long id,
                                                       @RequestBody CompleteOrderRequest request) {
        return ResponseEntity.ok(orderService.completeOrder(id, request.txnReference()));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('PURCHASER')")
    public ResponseEntity<OrderResponse> returnOrder(@PathVariable Long id,
                                                     @RequestBody PurchaserActionRequest request) {
        return ResponseEntity.ok(orderService.returnOrder(id, request.note()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('PURCHASER')")
    public ResponseEntity<OrderResponse> rejectOrder(@PathVariable Long id,
                                                     @RequestBody PurchaserActionRequest request) {
        return ResponseEntity.ok(orderService.rejectOrder(id, request.note()));
    }

    private UserRole getRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PURCHASER"))
                ? UserRole.PURCHASER : UserRole.CREATOR;
    }
}
```

- [ ] **Step 2: Run all backend tests**

```bash
cd backend && mvn test -q
```

Expected: `BUILD SUCCESS` — all tests PASSED.

- [ ] **Step 3: Start the backend and verify it runs**

```bash
cd backend && mvn spring-boot:run &
sleep 10
curl -s -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"creator1","password":"password"}' | python -m json.tool
```

Expected: JSON with `token`, `role: "CREATOR"`, `username: "creator1"`.

Stop the backend after verifying: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/oms/order/OrderController.java
git commit -m "feat: add order controller with role-based endpoints"
```

---

## Task 11: Frontend Scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Write `frontend/package.json`**

```json
{
  "name": "oms-frontend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1"
  }
}
```

- [ ] **Step 2: Write `frontend/vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
  },
})
```

- [ ] **Step 3: Write `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Management System</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
      input, button, select { font-family: inherit; font-size: 14px; padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
      button { cursor: pointer; background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 4px; }
      button:hover { background: #1565c0; }
      button.secondary { background: #fff; color: #333; border: 1px solid #ccc; }
      button.secondary:hover { background: #f0f0f0; }
      button.danger { background: #d32f2f; }
      button.danger:hover { background: #b71c1c; }
      button.warning { background: #f57c00; }
      button.warning:hover { background: #e65100; }
      button.success { background: #388e3c; }
      button.success:hover { background: #2e7d32; }
      table { border-collapse: collapse; width: 100%; }
      th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e0e0e0; }
      th { background: #fafafa; font-weight: 600; }
      tr:hover { background: #f9f9f9; }
      label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px; color: #555; }
      input { width: 100%; margin-bottom: 12px; }
      .error { color: #d32f2f; font-size: 13px; margin: 4px 0; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Write `frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Install dependencies and verify the dev server starts**

```bash
cd frontend && npm install
npm run dev &
sleep 5
curl -s http://localhost:4000 | grep -c "Order Management"
kill %1
```

Expected: `1` (the title is in the page).

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React+Vite frontend"
```

---

## Task 12: Auth Context, Axios Client, Routing

**Files:**
- Create: `frontend/src/api/axios.js`
- Create: `frontend/src/context/AuthContext.jsx`
- Create: `frontend/src/components/PrivateRoute.jsx`
- Create: `frontend/src/App.jsx`

- [ ] **Step 1: Write `frontend/src/api/axios.js`**

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 2: Write `frontend/src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    return token ? { token, role, username } : null;
  });

  const login = (token, role, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    setUser({ token, role, username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 3: Write `frontend/src/components/PrivateRoute.jsx`**

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
```

- [ ] **Step 4: Write `frontend/src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CreateOrderPage from './pages/CreateOrderPage';
import EditOrderPage from './pages/EditOrderPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

function Layout() {
  return (
    <>
      <NavBar />
      <main style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/orders" replace />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/new" element={<CreateOrderPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/orders/:id/edit" element={<EditOrderPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Verify the frontend builds without error**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: build error about missing page components (imports in App.jsx). This is expected — pages are created in the next tasks. Create placeholder stubs for now so the build passes:

Create `frontend/src/components/NavBar.jsx` stub:
```jsx
export default function NavBar() { return <nav style={{background:'#1976d2',padding:'12px 24px',color:'white'}}>OMS</nav>; }
```

Create `frontend/src/pages/LoginPage.jsx` stub:
```jsx
export default function LoginPage() { return <div>Login</div>; }
```

Create `frontend/src/pages/OrdersPage.jsx` stub:
```jsx
export default function OrdersPage() { return <div>Orders</div>; }
```

Create `frontend/src/pages/OrderDetailPage.jsx` stub:
```jsx
export default function OrderDetailPage() { return <div>Order Detail</div>; }
```

Create `frontend/src/pages/CreateOrderPage.jsx` stub:
```jsx
export default function CreateOrderPage() { return <div>Create Order</div>; }
```

Create `frontend/src/pages/EditOrderPage.jsx` stub:
```jsx
export default function EditOrderPage() { return <div>Edit Order</div>; }
```

Create `frontend/src/pages/ChangePasswordPage.jsx` stub:
```jsx
export default function ChangePasswordPage() { return <div>Change Password</div>; }
```

Create `frontend/src/components/StatusBadge.jsx` stub:
```jsx
export default function StatusBadge({ status }) { return <span>{status}</span>; }
```

Run build again:
```bash
cd frontend && npm run build 2>&1 | tail -5
```

Expected: `built in Xs`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/
git commit -m "feat: add auth context, axios client, routing, and component stubs"
```

---

## Task 13: Shared Components — NavBar and StatusBadge

**Files:**
- Modify: `frontend/src/components/NavBar.jsx`
- Modify: `frontend/src/components/StatusBadge.jsx`

- [ ] **Step 1: Write `frontend/src/components/StatusBadge.jsx`**

```jsx
const COLORS = {
  DRAFT: '#757575',
  SUBMITTED: '#1976d2',
  APPROVED: '#388e3c',
  COMPLETED: '#1b5e20',
  REJECTED: '#d32f2f',
  RETURNED: '#f57c00',
};

export default function StatusBadge({ status }) {
  return (
    <span style={{
      background: COLORS[status] || '#757575',
      color: 'white',
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.5,
    }}>
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Write `frontend/src/components/NavBar.jsx`**

```jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#1976d2',
      color: 'white',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 56,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }}>
      <span
        style={{ fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
        onClick={() => navigate('/orders')}
      >
        OMS
      </span>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 14 }}>{user?.username} · {user?.role}</span>
        <button
          className="secondary"
          style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.5)' }}
          onClick={() => navigate('/change-password')}
        >
          Change Password
        </button>
        <button
          style={{ background: 'white', color: '#1976d2', fontWeight: 600 }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Verify build still passes**

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Expected: `built in Xs`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: implement NavBar and StatusBadge components"
```

---

## Task 14: Login Page

**Files:**
- Modify: `frontend/src/pages/LoginPage.jsx`

- [ ] **Step 1: Write `frontend/src/pages/LoginPage.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      login(data.token, data.role, data.username);
      navigate('/orders');
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <div style={{
        background: 'white',
        padding: 40,
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        width: 360,
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#1976d2' }}>Order Management System</h1>
        <p style={{ margin: '0 0 24px', color: '#666', fontSize: 14 }}>Sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" style={{ width: '100%', marginTop: 8, padding: '10px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Expected: `built in Xs`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/LoginPage.jsx
git commit -m "feat: implement login page"
```

---

## Task 15: Orders List Page

**Files:**
- Modify: `frontend/src/pages/OrdersPage.jsx`

- [ ] **Step 1: Write `frontend/src/pages/OrdersPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Orders</h2>
        {user.role === 'CREATOR' && (
          <button onClick={() => navigate('/orders/new')}>+ New Order</button>
        )}
      </div>

      {orders.length === 0 ? (
        <p style={{ color: '#888' }}>No orders found.</p>
      ) : (
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Items</th>
                <th>Expires</th>
                <th>Created</th>
                {user.role === 'PURCHASER' && <th>Created By</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{order.title}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.items.length}</td>
                  <td>{order.expiresAt}</td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                  {user.role === 'PURCHASER' && <td>{order.createdBy}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Expected: `built in Xs`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/OrdersPage.jsx
git commit -m "feat: implement orders list page with role-aware columns"
```

---

## Task 16: Order Detail Page

**Files:**
- Modify: `frontend/src/pages/OrderDetailPage.jsx`

- [ ] **Step 1: Write `frontend/src/pages/OrderDetailPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [note, setNote] = useState('');
  const [txnRef, setTxnRef] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data));
  }, [id]);

  const doAction = async (action, body = {}) => {
    try {
      setError('');
      const { data } = await api.post(`/orders/${id}/${action}`, body);
      setOrder(data);
      setNote('');
      setTxnRef('');
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Action failed');
    }
  };

  if (!order) return <p>Loading…</p>;

  const isOwner = order.createdBy === user.username;
  const isCreator = user.role === 'CREATOR';
  const isPurchaser = user.role === 'PURCHASER';
  const canEdit = isCreator && isOwner && (order.status === 'DRAFT' || order.status === 'RETURNED');
  const canSubmit = canEdit;
  const canApprove = isPurchaser && order.status === 'SUBMITTED';
  const canActOnSubmitted = isPurchaser && order.status === 'SUBMITTED';
  const canComplete = isPurchaser && order.status === 'APPROVED';

  return (
    <div>
      <button className="secondary" onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>
        ← Back to Orders
      </button>

      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0 }}>{order.title}</h2>
          <StatusBadge status={order.status} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 24, color: '#555', fontSize: 14 }}>
          <span>Created by: <strong>{order.createdBy}</strong></span>
          <span>Expires: <strong>{order.expiresAt}</strong></span>
          {order.createdAt && <span>Created: <strong>{new Date(order.createdAt).toLocaleString()}</strong></span>}
        </div>
      </div>

      {order.purchaserNote && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <strong>Note from Purchaser:</strong> {order.purchaserNote}
        </div>
      )}

      {order.txnReference && (
        <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <strong>Transaction Reference:</strong> {order.txnReference}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px' }}>Items</h3>
        <table>
          <thead>
            <tr><th>Item Name</th><th>Quantity</th></tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="error" style={{ fontSize: 14 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {canEdit && (
          <button className="secondary" onClick={() => navigate(`/orders/${id}/edit`)}>Edit</button>
        )}
        {canSubmit && (
          <button className="success" onClick={() => doAction('submit')}>Submit</button>
        )}
        {canApprove && (
          <button className="success" onClick={() => doAction('approve')}>Approve</button>
        )}
        {canActOnSubmitted && (
          <>
            <input
              placeholder="Add a note for creator..."
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ width: 260, marginBottom: 0 }}
            />
            <button className="warning" onClick={() => doAction('return', { note })}>Return</button>
            <button className="danger" onClick={() => doAction('reject', { note })}>Reject</button>
          </>
        )}
        {canComplete && (
          <>
            <input
              placeholder="Transaction reference..."
              value={txnRef}
              onChange={e => setTxnRef(e.target.value)}
              style={{ width: 220, marginBottom: 0 }}
            />
            <button className="success" onClick={() => doAction('complete', { txnReference: txnRef })}>
              Mark Complete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Expected: `built in Xs`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/OrderDetailPage.jsx
git commit -m "feat: implement order detail page with context-aware action buttons"
```

---

## Task 17: Create and Edit Order Pages

**Files:**
- Modify: `frontend/src/pages/CreateOrderPage.jsx`
- Modify: `frontend/src/pages/EditOrderPage.jsx`

- [ ] **Step 1: Write `frontend/src/pages/CreateOrderPage.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [items, setItems] = useState([{ itemName: '', quantity: 1 }]);
  const [error, setError] = useState('');

  const addItem = () => setItems([...items, { itemName: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: field === 'quantity' ? Number(value) : value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/orders', { title, expiresAt, items });
      navigate(`/orders/${data.id}`);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to create order');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <button className="secondary" onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>
        ← Back
      </button>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px' }}>New Order</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Q3 Stationery Restock" />
          <label>Expiry Date</label>
          <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />

          <h3 style={{ margin: '16px 0 8px' }}>Items</h3>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                placeholder="Item name"
                value={item.itemName}
                onChange={e => updateItem(i, 'itemName', e.target.value)}
                required
                style={{ flex: 1, marginBottom: 0 }}
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)}
                required
                style={{ width: 80, marginBottom: 0 }}
              />
              {items.length > 1 && (
                <button type="button" className="danger" onClick={() => removeItem(i)} style={{ padding: '6px 10px' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="secondary" onClick={addItem} style={{ marginBottom: 16 }}>
            + Add Item
          </button>

          {error && <p className="error">{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Save as Draft</button>
            <button type="button" className="secondary" onClick={() => navigate('/orders')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `frontend/src/pages/EditOrderPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function EditOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setTitle(data.title);
      setExpiresAt(data.expiresAt);
      setItems(data.items.map(i => ({ itemName: i.itemName, quantity: i.quantity })));
      setLoading(false);
    });
  }, [id]);

  const addItem = () => setItems([...items, { itemName: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: field === 'quantity' ? Number(value) : value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/orders/${id}`, { title, expiresAt, items });
      navigate(`/orders/${id}`);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to update order');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <button className="secondary" onClick={() => navigate(`/orders/${id}`)} style={{ marginBottom: 16 }}>
        ← Back
      </button>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px' }}>Edit Order</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
          <label>Expiry Date</label>
          <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />

          <h3 style={{ margin: '16px 0 8px' }}>Items</h3>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                placeholder="Item name"
                value={item.itemName}
                onChange={e => updateItem(i, 'itemName', e.target.value)}
                required
                style={{ flex: 1, marginBottom: 0 }}
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)}
                required
                style={{ width: 80, marginBottom: 0 }}
              />
              {items.length > 1 && (
                <button type="button" className="danger" onClick={() => removeItem(i)} style={{ padding: '6px 10px' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="secondary" onClick={addItem} style={{ marginBottom: 16 }}>
            + Add Item
          </button>

          {error && <p className="error">{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Save Changes</button>
            <button type="button" className="secondary" onClick={() => navigate(`/orders/${id}`)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Expected: `built in Xs`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/CreateOrderPage.jsx frontend/src/pages/EditOrderPage.jsx
git commit -m "feat: implement create and edit order pages"
```

---

## Task 18: Change Password Page

**Files:**
- Modify: `frontend/src/pages/ChangePasswordPage.jsx`

- [ ] **Step 1: Write `frontend/src/pages/ChangePasswordPage.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to change password');
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 400 }}>
        <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          Password changed successfully.
        </div>
        <button onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <button className="secondary" onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>
        ← Back
      </button>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px' }}>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <label>Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <label>Confirm New Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          {error && <p className="error">{error}</p>}
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify final build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Expected: `built in Xs`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/ChangePasswordPage.jsx
git commit -m "feat: implement change password page"
```

---

## Task 19: End-to-End Smoke Test

Manual verification that the full stack works together.

- [ ] **Step 1: Start the backend**

```bash
cd backend && mvn spring-boot:run > /tmp/oms-backend.log 2>&1 &
sleep 15
curl -s http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"creator1","password":"password"}' | python -m json.tool
```

Expected: JSON with `token`, `role: "CREATOR"`, `username: "creator1"`.

- [ ] **Step 2: Start the frontend**

```bash
cd frontend && npm run dev > /tmp/oms-frontend.log 2>&1 &
sleep 5
curl -s http://localhost:4000 | grep -c "Order Management"
```

Expected: `1`

- [ ] **Step 3: Run the backend test suite**

```bash
cd backend && mvn test -q
```

Expected: `BUILD SUCCESS` — all tests PASSED (AuthControllerTest + OrderServiceTest).

- [ ] **Step 4: Manual login smoke test using curl**

```bash
TOKEN=$(curl -s -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"creator1","password":"password"}' | python -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Create a draft order
curl -s -X POST http://localhost:8085/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Order","expiresAt":"2026-12-31","items":[{"itemName":"Pen","quantity":10}]}' | python -m json.tool
```

Expected: JSON with `status: "DRAFT"`, `id` set.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete OMS implementation - backend + frontend"
```

---

## Seed Credentials

| Username | Password | Role |
|---|---|---|
| `creator1` | `password` | CREATOR |
| `purchaser1` | `password` | PURCHASER |

---

## Running the App

```bash
# Terminal 1 — Backend
cd backend && mvn spring-boot:run

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:4000
- Backend API: http://localhost:8085/api
- H2 Console: http://localhost:8085/h2-console (JDBC URL: `jdbc:h2:file:./data/oms`)
