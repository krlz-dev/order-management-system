package com.inform.orderms.controller;

import com.inform.orderms.dto.ErrorResponse;
import com.inform.orderms.dto.LoginRequest;
import com.inform.orderms.dto.LoginResponse;
import com.inform.orderms.dto.RefreshTokenRequest;
import com.inform.orderms.dto.ValidationResponse;
import com.inform.orderms.dto.UserDto;
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
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        UserDto userDto = userService.convertToDto(user);
        LoginResponse response = new LoginResponse(token, refreshToken, jwtExpiration / 1000, userDto); // Convert to seconds
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token", description = "Check if the provided JWT token is valid and not expired")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token is valid"),
        @ApiResponse(responseCode = "401", description = "Token is invalid or expired")
    })
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ErrorResponse errorResponse = new ErrorResponse("INVALID_HEADER", "Authorization header missing or invalid format");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        String token = authHeader.substring(7);
        
        if (jwtUtil.validateToken(token)) {
            String email = jwtUtil.getEmailFromToken(token);
            ValidationResponse validationResponse = new ValidationResponse(true, email);
            return ResponseEntity.ok(validationResponse);
        } else {
            ErrorResponse errorResponse = new ErrorResponse("INVALID_TOKEN", "Token is invalid or expired");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generate a new access token using a valid refresh token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    public ResponseEntity<?> refreshToken(
            @Parameter(description = "Refresh token request") @Valid @RequestBody RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();
            
            if (!jwtUtil.validateToken(refreshToken)) {
                ErrorResponse errorResponse = new ErrorResponse("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            if (!jwtUtil.isRefreshToken(refreshToken)) {
                ErrorResponse errorResponse = new ErrorResponse("INVALID_TOKEN_TYPE", "Token is not a refresh token");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String email = jwtUtil.getEmailFromToken(refreshToken);
            Optional<User> userOpt = userService.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                ErrorResponse errorResponse = new ErrorResponse("USER_NOT_FOUND", "User not found");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String newAccessToken = jwtUtil.generateToken(email);
            String newRefreshToken = jwtUtil.generateRefreshToken(email);
            User user = userOpt.get();
            UserDto userDto = userService.convertToDto(user);
            LoginResponse response = new LoginResponse(newAccessToken, newRefreshToken, jwtExpiration / 1000, userDto);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ErrorResponse errorResponse = new ErrorResponse("TOKEN_REFRESH_ERROR", "Failed to refresh token");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
}