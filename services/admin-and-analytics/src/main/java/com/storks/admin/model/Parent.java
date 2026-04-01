package com.storks.admin.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "parents")
@DiscriminatorValue("PARENT")
public class Parent extends User {
}
