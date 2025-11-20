package com.inform.orderms.config;

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

    @Override
    public void run(String... args) throws Exception {
        createDefaultUsers();
    }

    private void createDefaultUsers() {
        // Create admin1@orderflow.com / admin1
        if (userService.findByEmail("admin1@orderflow.com").isEmpty()) {
            userService.createUser("admin1@orderflow.com", "admin1");
            log.info("Created user: admin1@orderflow.com");
        }

        // Create admin2@orderflow.com / admin2
        if (userService.findByEmail("admin2@orderflow.com").isEmpty()) {
            userService.createUser("admin2@orderflow.com", "admin2");
            log.info("Created user: admin2@orderflow.com");
        }

        // Create admin3@orderflow.com / admin3
        if (userService.findByEmail("admin3@orderflow.com").isEmpty()) {
            userService.createUser("admin3@orderflow.com", "admin3");
            log.info("Created user: admin3@orderflow.com");
        }
    }
}