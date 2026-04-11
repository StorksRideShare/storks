package com.storks.models;

import com.storks.models.types.SchoolGrade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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

    private School school;
    private String firstName;
    private String lastName;
    private String preferredName;
    private String pronouns;

    @Enumerated(EnumType.STRING)
    private SchoolGrade grade;

    @OneToMany(mappedBy = "child",  fetch = FetchType.LAZY,  cascade = CascadeType.ALL)
    private List<Schedule> customSchedules = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ChildGroup group;

    private String qrHash;

    public Child() {}
}
