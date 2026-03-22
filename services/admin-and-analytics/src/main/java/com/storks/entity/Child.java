package com.storks.entity;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonView;
import com.storks.views.UserViews;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "children")
@Data
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Visible to everyone (driver, parent, admin)
    @JsonView({UserViews.DriverView.class, UserViews.ParentView.class, UserViews.AdminView.class})
    @Column(nullable = false)
    private String name;

    // Visible even to driver (preferred calling name)
    @JsonView({UserViews.DriverView.class, UserViews.ParentView.class, UserViews.AdminView.class})
    private String preferredName;

    // Only admin should see pronouns
    @JsonView(UserViews.AdminView.class)
    private String pronouns;

    // Age & grade – only admin (sensitive personal info)
    @JsonView(UserViews.AdminView.class)
    private Integer age;

    @JsonView(UserViews.AdminView.class)
    private String grade;

    // School name – visible to parent, arguably also to driver (practical need)
    @JsonView({UserViews.ParentView.class, UserViews.DriverView.class, UserViews.AdminView.class})
    @Column(nullable = false)
    private String school;

    // Very sensitive medical & disability information – ONLY admin
    @JsonView(UserViews.AdminView.class)
    @ElementCollection
    @CollectionTable(name = "child_disabilities", joinColumns = @JoinColumn(name = "child_id"))
    private List<String> disabilities;

    @JsonView(UserViews.AdminView.class)
    @ElementCollection
    @CollectionTable(name = "child_medical_notes", joinColumns = @JoinColumn(name = "child_id"))
    private List<String> medicalNotes;

    // ────────────────────────────────────────────────
    // Location fields – VERY IMPORTANT MASKING
    // ────────────────────────────────────────────────

    // Full permanent home address → ONLY admin ever sees this
    @JsonView(UserViews.AdminView.class)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permanent_address_id")
    private Location permanentAddress;

    // Current / active pickup location – parent sees during active ride
    // Driver might need approximate location or pickup point (but not full address)
    @JsonView(UserViews.ParentView.class)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_pickup_location_id")
    private Location currentPickupLocation;

    // You can add more fields later (photo, emergency contact, etc.)
}