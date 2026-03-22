package com.storks.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonView;
import com.storks.entity.Child;
import com.storks.service.PrivacyMaskingService;
import com.storks.views.UserViews;

import lombok.Data;

@Data
public class ChildDto {

    @JsonView({UserViews.DriverView.class, UserViews.ParentView.class, UserViews.AdminView.class})
    private UUID id;

    @JsonView({UserViews.DriverView.class, UserViews.ParentView.class, UserViews.AdminView.class})
    private String name;

    @JsonView(UserViews.DriverView.class)
    private String preferredName;

    @JsonView(UserViews.AdminView.class)
    private String pronouns;

    // ... add more fields with appropriate views

    // Constructor / mapper from entity → dto
    public static ChildDto fromEntity(Child child) {
        ChildDto dto = new ChildDto();
        dto.setId(child.getId());
        dto.setName(child.getName());
        dto.setPreferredName(child.getPreferredName());
        // conditionally set more based on logic if needed
        return dto;
    }

    // Add inside ChildDto class
public ChildDto applyPrivacyMask(PrivacyMaskingService maskingService, UUID parentUserId) {
    return maskingService.maskObject(this, parentUserId);
}
}