package com.storks.userservice.model;

import com.storks.userservice.model.types.SchoolGrade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "children")
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID childId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Parent parent;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "name",             column = @Column(name = "school_name")),
        @AttributeOverride(name = "address",          column = @Column(name = "school_address")),
        @AttributeOverride(name = "principalNumber",  column = @Column(name = "school_principal_number")),
        @AttributeOverride(name = "teacherNumber",    column = @Column(name = "school_teacher_number")),
        @AttributeOverride(name = "emergencyContact", column = @Column(name = "school_emergency_contact"))
    })
    private School school;

    private String firstName;
    private String lastName;
    private String preferredName;
    private String pronouns;

    private LocalDate dateOfBirth;

    private String identificationDescription;
    private String frontPictureUrl;
    private String sidePictureUrl;

    @Enumerated(EnumType.STRING)
    private SchoolGrade grade;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "child_disabilities", joinColumns = @JoinColumn(name = "child_id"))
    @Column(name = "disability")
    private List<String> disabilities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "child_medical_notes", joinColumns = @JoinColumn(name = "child_id"))
    @Column(name = "note")
    private List<String> medicalNotes = new ArrayList<>();

    @OneToMany(mappedBy = "child", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Schedule> customSchedules = new ArrayList<>();

    @OneToMany(mappedBy = "child", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WeeklyScheduleEntry> weeklySchedules = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ChildGroup group;

    private String qrHash;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public Child() {}
}
