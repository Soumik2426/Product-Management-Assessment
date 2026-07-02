package com.Assessment.product_management_api.repository;

import com.Assessment.product_management_api.entity.Role;
import com.Assessment.product_management_api.entity.UserEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void savesAndFindsUserByEmail() {
        UserEntity userEntity = new UserEntity();
        userEntity.setFirstName("Soumik");
        userEntity.setLastName("Das");
        userEntity.setEmail("soumik@example.com");
        userEntity.setPassword("encoded-password");
        userEntity.setRole(Role.USER);

        userRepository.save(userEntity);

        Optional<UserEntity> result = userRepository.findByEmail("soumik@example.com");

        assertTrue(result.isPresent());
        assertTrue(userRepository.existsByEmail("soumik@example.com"));
    }
}