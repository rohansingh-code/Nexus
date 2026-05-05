package com.example.springboot.hospitalManagement.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final StringRedisTemplate redisTemplate;
    private final AuthUtil authUtil;

    private static final String PREFIX = "refresh:";

    public void store(String token, String username) {
        redisTemplate.opsForValue().set(
                PREFIX + token,
                username,
                authUtil.getRefreshTokenExpiryMs(),
                TimeUnit.MILLISECONDS
        );
    }

    public Optional<String> getUsername(String token) {
        return Optional.ofNullable(
                redisTemplate.opsForValue().get(PREFIX + token)
        );
    }

    public void delete(String token) {
        redisTemplate.delete(PREFIX + token);
    }

    // Called on every /refresh  old token deleted, new one stored
    public String rotate(String oldToken, String username) {
        delete(oldToken);
        String newToken = authUtil.generateRefreshToken();
        store(newToken, username);
        return newToken;
    }
}
