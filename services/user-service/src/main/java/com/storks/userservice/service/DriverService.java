package com.storks.userservice.service;

import com.storks.models.Driver;
import com.storks.models.User;
import com.storks.models.types.RoleType;
import com.storks.userservice.dto.DriverProfileResponse;
import com.storks.userservice.repository.DriverRepository;
import com.storks.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;

    // ── Profile ───────────────────────────────────────────────────────────────

    public DriverProfileResponse getProfile(String providerUserId) {
        User user = userRepository.findByProviderUserId(providerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver profile not found"));

        if (!(user instanceof Driver driver)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a driver");
        }

        String phone = "";
        if (driver.getContactPrimaryNumber() != null) {
            phone = driver.getContactPrimaryNumber().getCountryCode()
                    + driver.getContactPrimaryNumber().getNumber();
        }

        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();

        return DriverProfileResponse.builder()
                .id(user.getUserId().toString())
                .userId(user.getUserId().toString())
                .fullName(fullName)
                .firstName(user.getFirstName() != null ? user.getFirstName() : "")
                .lastName(user.getLastName() != null ? user.getLastName() : "")
                .email(user.getEmail() != null ? user.getEmail() : "")
                .phone(phone)
                .profilePictureUrl(user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "")
                .role(user.getRole() != null ? user.getRole().name() : RoleType.DRIVER.name())
                .onboarded(user.isOnboarded())
                .build();
    }

    // ── Sync / Provision ──────────────────────────────────────────────────────

    @Transactional
    public Driver syncDriver(String providerUserId, String email, String firstName,
                             String lastName, String pictureUrl) {
        return driverRepository.findByProviderUserId(providerUserId)
                .orElseGet(() -> {
                    log.info("Provisioning new Driver: {}", providerUserId);
                    Driver driver = new Driver();
                    driver.setProviderUserId(providerUserId);
                    driver.setEmail(email);
                    driver.setFirstName(firstName);
                    driver.setLastName(lastName);
                    driver.setProfilePictureUrl(pictureUrl);
                    driver.setRole(RoleType.DRIVER);
                    driver.setLastLoggedIn(LocalDateTime.now());
                    return driverRepository.save(driver);
                });
    }
}
