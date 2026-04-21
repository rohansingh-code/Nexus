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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;

    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword()));
        User user = (User) authentication.getPrincipal();

        String token = authUtil.generateAccessToken(user);

        return new LoginResponseDto(token, user.getId());
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
}
