package com.inform.orderms.config;

import com.inform.orderms.model.Role;
import com.inform.orderms.repository.RoleRepository;
import com.inform.orderms.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserService userService;
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        createDefaultUsers();
    }

    private void initializeRoles() {
        for (Role.RoleName roleName : Role.RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
                log.info("Created role: {}", roleName);
            }
        }
    }

    private void createDefaultUsers() {
        // Create admin@orderflow.com / admin123 (ADMIN)
        if (userService.findByEmail("admin@orderflow.com").isEmpty()) {
            userService.createUser("admin@orderflow.com", "admin123", "Admin", Role.RoleName.ADMIN);
            log.info("Created admin user: admin@orderflow.com");
        }

        // Create customer users
        createCustomerIfNotExists("rodrigo.perez@orderflow.com", "password123", "Rodrigo Perez");
        createCustomerIfNotExists("andrea.torrez@orderflow.com", "password123", "Andrea Torrez");
        createCustomerIfNotExists("jorge.robles@orderflow.com", "password123", "Jorge Robles");
    }

    private void createCustomerIfNotExists(String email, String password, String name) {
        if (userService.findByEmail(email).isEmpty()) {
            userService.createUser(email, password, name, Role.RoleName.CUSTOMER);
            log.info("Created customer user: {} - {}", email, name);
        }
    }
}