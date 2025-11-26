package com.inform.orderms.service;

import com.inform.orderms.dto.UserDto;
import com.inform.orderms.model.Role;
import com.inform.orderms.model.User;
import com.inform.orderms.repository.RoleRepository;
import com.inform.orderms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public List<UUID> findUserIdsByEmailContaining(String searchTerm) {
        return userRepository.findByEmailContainingIgnoreCase(searchTerm)
                .stream()
                .map(User::getId)
                .collect(Collectors.toList());
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public User createUser(String email, String password, String name, Role.RoleName roleName) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        
        // Find or create role
        Optional<Role> roleOpt = roleRepository.findByName(roleName);
        Role role;
        if (roleOpt.isPresent()) {
            role = roleOpt.get();
        } else {
            role = new Role();
            role.setName(roleName);
            role = roleRepository.save(role);
        }
        
        user.getRoles().add(role);
        return userRepository.save(user);
    }

    public User createUser(String email, String password) {
        return createUser(email, password, "User", Role.RoleName.CUSTOMER);
    }

    public UserDto convertToDto(User user) {
        if (user == null) return null;
        
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
        
        return new UserDto(
                user.getId().toString(),
                user.getEmail(),
                user.getName(),
                roleNames
        );
    }
}