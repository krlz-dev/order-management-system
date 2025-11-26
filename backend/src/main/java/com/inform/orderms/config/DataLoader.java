package com.inform.orderms.config;

import com.inform.orderms.model.Product;
import com.inform.orderms.model.Role;
import com.inform.orderms.repository.ProductRepository;
import com.inform.orderms.repository.RoleRepository;
import com.inform.orderms.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Running DataLoader initialization...");
        initializeRoles();
        createDefaultUsers();
        createDefaultProducts();
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

    private void createDefaultProducts() {
        if (productRepository.count() == 0) {
            String[] productNames = {
                "Laptop Pro 16", "Wireless Mouse", "Mechanical Keyboard", "USB-C Hub", "External Monitor 27in",
                "Smartphone Case", "Bluetooth Headphones", "Portable Charger", "Standing Desk", "Ergonomic Chair",
                "Coffee Mug", "Notebook Set", "Pen Collection", "Desk Lamp LED", "Plant Pot Small",
                "Water Bottle", "Backpack Canvas", "Tablet Stand", "Cable Organizer", "Webcam HD",
                "Microphone USB", "Book Programming", "Sticker Pack", "Phone Grip", "Screen Cleaner",
                "Mousepad Large", "Speaker Bluetooth", "Fitness Tracker", "Gaming Controller", "Hard Drive External",
                "Memory Card 64GB", "Router WiFi 6", "Ethernet Cable 5m", "Printer Wireless", "Scanner Portable",
                "Projector Mini", "Smart Watch", "Earbuds Wireless", "Camera Action", "Tripod Compact",
                "Lens Cleaning Kit", "Power Strip Smart", "Light Strip RGB", "Alarm Clock Digital", "Calculator Scientific",
                "Whiteboard Small", "Marker Set", "Sticky Notes", "File Organizer", "Desk Mat XXL",
                "ladle", "bag of popcorn", "handbasket", "pair of glasses", "chalk",
                "sticker book", "can of whipped cream", "jar of pickles", "toy robot", "music CD",
                "plush rabbit", "pair of dice", "pepper shaker", "tennis racket", "tennis ball",
                "knife", "pair of water goggles", "lotion", "dagger", "washing machine",
                "spool of wire", "clay pot", "butter knife", "squirt gun", "sun glasses",
                "tissue box", "container of pudding", "spool of string", "purse/bag", "blowdryer",
                "fork", "white out", "rock", "comb", "pinecone",
                "banana", "floor", "shawl", "tea pot", "lace",
                "flag", "scarf", "baseball", "hand bag", "wallet",
                "whip", "candy bar", "game cartridge", "laser pointer", "toe ring",
                "snail shell", "shirt button", "turtle", "towel", "pants",
                "mirror", "box of baking soda", "speakers", "pearl necklace", "pair of knitting needles",
                "remote", "bow", "jar of jam", "cellphone", "wrench",
                "socks", "radio", "ipod charger", "ring", "spice bottle",
                "pair of earrings", "cars", "broccoli", "canvas", "quartz crystal",
                "coffee pot", "bottle of honey", "trucks", "flowers", "brush",
                "pair of scissors", "plush dog", "candy cane", "pasta strainer", "pool stick",
                "plush octopus", "model car", "toothpaste", "magnifying glass", "scotch tape",
                "rubber stamp", "slipper"
            };

            for (String productName : productNames) {
                Product product = new Product();
                product.setName(productName);
                product.setPrice(BigDecimal.valueOf(10 + Math.random() * 990).setScale(2, BigDecimal.ROUND_HALF_UP));
                product.setStock((int) (Math.random() * 100) + 1);
                productRepository.save(product);
            }
            log.info("Created {} default products", productNames.length);
        } else {
            log.info("Products already exist, skipping product creation");
        }
    }
}