package com.storks.userservice.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class School {

    private String name;
    private String address;
    private String principalNumber;
    private String teacherNumber;
    private String emergencyContact;

    public School() {}

    public School(String name) {
        this.name = name;
    }
}
