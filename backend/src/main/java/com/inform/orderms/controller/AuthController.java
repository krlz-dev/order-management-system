package com.inform.orderms.controller;

import com.inform.orderms.dto.LoginRequest;
import com.inform.orderms.dto.LoginResponse;
import com.inform.orderms.model.User;
import com.inform.orderms.service.UserService;
import com.inform.orderms.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication operations")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT access token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<?> login(
            @Parameter(description = "Login credentials") @Valid @RequestBody LoginRequest loginRequest) {
        
        Optional<User> userOpt = userService.findByEmail(loginRequest.getEmail());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
        
        User user = userOpt.get();
        
        if (!userService.validatePassword(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
        
        String token = jwtUtil.generateToken(user.getEmail());
        LoginResponse response = new LoginResponse(token, jwtExpiration / 1000); // Convert to seconds
        
        return ResponseEntity.ok(response);
    }
}