package com.storks.matching.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;

    private String pickupLocation;
    private String dropLocation;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;
}