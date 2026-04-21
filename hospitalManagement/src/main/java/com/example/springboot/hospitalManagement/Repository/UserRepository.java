package com.example.springboot.hospitalManagement.Repository;

import com.example.springboot.hospitalManagement.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
}