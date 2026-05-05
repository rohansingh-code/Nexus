package com.example.springboot.hospitalManagement.security;

import com.example.springboot.hospitalManagement.Entity.Patient;
import com.example.springboot.hospitalManagement.Entity.User;
import com.example.springboot.hospitalManagement.Entity.type.RoleType;
import com.example.springboot.hospitalManagement.Repository.PatientRepository;
import com.example.springboot.hospitalManagement.Repository.UserRepository;
import com.example.springboot.hospitalManagement.dto.LoginRequestDto;
import com.example.springboot.hospitalManagement.dto.LoginResponseDto;
import com.example.springboot.hospitalManagement.dto.SignUpRequestDto;
import com.example.springboot.hospitalManagement.dto.SignUpResponseDto;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final RefreshTokenService refreshTokenService; 

    public LoginResponseDto login(LoginRequestDto loginRequestDto, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.getUsername(), loginRequestDto.getPassword()));
        User user = (User) authentication.getPrincipal();

        String accessToken = authUtil.generateAccessToken(user);


        String refreshToken = authUtil.generateRefreshToken();
        refreshTokenService.store(refreshToken, user.getUsername());
        setRefreshCookie(response, refreshToken);

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return new LoginResponseDto(accessToken, user.getId(), roles);
    }

    public LoginResponseDto refresh(String refreshToken, HttpServletResponse response) {
        String username = refreshTokenService.getUsername(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Refresh token invalid or expired"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        String newAccessToken = authUtil.generateAccessToken(user);
        String newRefreshToken = refreshTokenService.rotate(refreshToken, username);
        setRefreshCookie(response, newRefreshToken);

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return new LoginResponseDto(newAccessToken, user.getId(), roles);
    }

    public void logout(String refreshToken, HttpServletResponse response) {
        if (refreshToken != null) {
            refreshTokenService.delete(refreshToken);
        }
        clearRefreshCookie(response);
    }

    public SignUpResponseDto signup(SignUpRequestDto signUpRequestDto) {
        User user = userRepository.findByUsername(signUpRequestDto.getUsername()).orElse(null);

        if (user != null) {
            throw new IllegalArgumentException("user already exists");
        }

        user = userRepository.save(User.builder()
                .username(signUpRequestDto.getUsername())
                .password(passwordEncoder.encode(signUpRequestDto.getPassword()))
                .roles(Set.of(RoleType.PATIENT))
                .build());

        Patient patient = Patient.builder()
                .name(signUpRequestDto.getName())
                .email(signUpRequestDto.getUsername())
                .birthDate(signUpRequestDto.getBirthDate())
                .gender(signUpRequestDto.getGender())
                .bloodGroup(signUpRequestDto.getBloodGroup())
                .user(user)
                .build();

        patientRepository.save(patient);

        return new SignUpResponseDto(user.getId(), user.getUsername());
    }


    private void setRefreshCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(false)              // true in prod
                .path("/api/v1/auth/refresh")  
                .maxAge(Duration.ofDays(7))
                .sameSite("Lax")            // Strict in prod
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/auth/refresh")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}