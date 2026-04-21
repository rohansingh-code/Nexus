package com.example.springboot.hospitalManagement.controller;

import com.example.springboot.hospitalManagement.dto.LoginRequestDto;
import com.example.springboot.hospitalManagement.dto.LoginResponseDto;
import com.example.springboot.hospitalManagement.dto.SignUpRequestDto;
import com.example.springboot.hospitalManagement.dto.SignUpResponseDto;
import com.example.springboot.hospitalManagement.security.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> loginUser(@Valid @RequestBody LoginRequestDto loginRequestDto){

        return ResponseEntity.ok(authService.login(loginRequestDto));

    }

    @PostMapping("/signup")
    public ResponseEntity<SignUpResponseDto> signup(@Valid @RequestBody SignUpRequestDto signUpRequestDto){

        return ResponseEntity.ok(authService.signup(signUpRequestDto));

    }
}
