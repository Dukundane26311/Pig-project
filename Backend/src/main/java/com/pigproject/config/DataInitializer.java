package com.pigproject.config;

import com.pigproject.entity.User;
import com.pigproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.pigproject.entity.Role;
import com.pigproject.entity.RecordStatus;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@valueprotocols.rw");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(RecordStatus.ACTIVE);
            userRepository.save(admin);
            
            System.out.println("Default admin created: admin@valueprotocols.rw / admin123");
        }
    }
}
