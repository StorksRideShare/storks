package com.storks.userservice.service;

import com.storks.userservice.dto.OnboardingRequest;
import com.storks.userservice.dto.OnboardingResponse;
import com.storks.userservice.model.Parent;
import com.storks.userservice.model.PhoneNumber;
import com.storks.userservice.repository.ParentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final ParentRepository parentRepository;

    public OnboardingResponse completeOnboarding(String clerkUserId, OnboardingRequest req) {
        Parent parent = parentRepository.findByProviderUserId(clerkUserId)
                .orElseThrow(() -> new RuntimeException("User not found: " + clerkUserId));

        parent.setFirstName(req.firstName());
        parent.setLastName(req.lastName());
        parent.setProfilePictureUrl(req.profilePictureUrl());
        parent.setDateOfBirth(
                LocalDate.parse(req.dateOfBirth(), DateTimeFormatter.ofPattern("dd-MM-yyyy"))
        );
        parent.setContactPrimaryNumber(
                new PhoneNumber(req.primaryCountryCode(), req.primaryNumber(), true)
        );

        // Use new ArrayList — Collections.emptyList() is immutable and Hibernate can't modify it
        List<PhoneNumber> secondaries = new ArrayList<>();
        if (req.secondaryNumbers() != null) {
            for (OnboardingRequest.SecondaryPhone s : req.secondaryNumbers()) {
                if (s.number() != null && !s.number().isBlank()) {
                    secondaries.add(new PhoneNumber(s.countryCode(), s.number()));
                }
            }
        }
        parent.setSecondaryPhoneNumbers(secondaries);

        parent.setOnboarded(true);
        parentRepository.save(parent);

        return new OnboardingResponse(true, "Onboarding complete.");
    }
}