package com.storks.userservice.service;

import com.storks.userservice.dto.ChildResponse;
import com.storks.userservice.dto.CreateChildRequest;
import com.storks.userservice.dto.WeeklyScheduleDto;
import com.storks.userservice.model.*;
import com.storks.userservice.model.types.SchoolGrade;
import com.storks.userservice.repository.ChildRepository;
import com.storks.userservice.repository.ParentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository childRepository;
    private final ParentRepository parentRepository;

    private static final DateTimeFormatter DOB_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    @Transactional
    public ChildResponse addChild(String clerkUserId, CreateChildRequest req) {
        Parent parent = parentRepository.findByProviderUserId(clerkUserId)
                .orElseThrow(() -> new RuntimeException("Parent not found: " + clerkUserId));

        Child child = new Child();
        child.setParent(parent);
        child.setFirstName(req.firstName());
        child.setLastName(req.lastName());
        child.setPreferredName(req.preferredName());
        child.setPronouns(req.pronouns());
        child.setFrontPictureUrl(req.frontPictureUrl());
        child.setSidePictureUrl(req.sidePictureUrl());
        child.setIdentificationDescription(req.identificationDescription());
        child.setQrHash(UUID.randomUUID().toString().replace("-", "").substring(0, 16));

        if (req.dateOfBirth() != null && !req.dateOfBirth().isBlank()) {
            child.setDateOfBirth(LocalDate.parse(req.dateOfBirth(), DOB_FORMAT));
        }

        if (req.schoolName() != null && !req.schoolName().isBlank()) {
            School school = new School(req.schoolName());
            school.setAddress(req.schoolAddress());
            child.setSchool(school);
        }

        if (req.grade() != null && !req.grade().isBlank()) {
            child.setGrade(SchoolGrade.valueOf(req.grade()));
        }

        if (req.disabilities() != null) {
            child.setDisabilities(new ArrayList<>(req.disabilities()));
        }

        if (req.medicalNotes() != null) {
            child.setMedicalNotes(new ArrayList<>(req.medicalNotes()));
        }

        Child saved = childRepository.save(child);

        if (req.weeklySchedule() != null && !req.weeklySchedule().isEmpty()) {
            List<WeeklyScheduleEntry> entries = new ArrayList<>();
            for (WeeklyScheduleDto dto : req.weeklySchedule()) {
                if ((dto.customDropoffAddress() != null && !dto.customDropoffAddress().isBlank())
                        || (dto.customPickupAddress() != null && !dto.customPickupAddress().isBlank())) {
                    WeeklyScheduleEntry entry = new WeeklyScheduleEntry();
                    entry.setChild(saved);
                    entry.setDayOfWeek(dto.dayOfWeek());
                    entry.setCustomDropoffAddress(dto.customDropoffAddress());
                    entry.setCustomPickupAddress(dto.customPickupAddress());
                    entries.add(entry);
                }
            }
            saved.setWeeklySchedules(entries);
            saved = childRepository.save(saved);
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ChildResponse> getChildren(String clerkUserId) {
        return childRepository.findByParent_ProviderUserId(clerkUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteChild(String clerkUserId, UUID childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found: " + childId));
        if (!child.getParent().getProviderUserId().equals(clerkUserId)) {
            throw new RuntimeException("Not authorised to delete this child");
        }
        childRepository.delete(child);
    }

    private ChildResponse toResponse(Child child) {
        String dob = null;
        Integer age = null;
        if (child.getDateOfBirth() != null) {
            dob = child.getDateOfBirth().format(DOB_FORMAT);
            age = Period.between(child.getDateOfBirth(), LocalDate.now()).getYears();
        }

        String schoolName = child.getSchool() != null ? child.getSchool().getName() : null;

        List<WeeklyScheduleDto> schedule = child.getWeeklySchedules().stream()
                .map(e -> new WeeklyScheduleDto(
                        e.getDayOfWeek(),
                        e.getCustomDropoffAddress(),
                        e.getCustomPickupAddress()))
                .toList();

        return new ChildResponse(
                child.getChildId(),
                child.getFirstName(),
                child.getLastName(),
                child.getPreferredName(),
                dob,
                age,
                schoolName,
                child.getFrontPictureUrl(),
                child.getQrHash(),
                child.getDisabilities(),
                child.getMedicalNotes(),
                schedule
        );
    }
}
