package com.storks.admin.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "drivers")
@DiscriminatorValue("DRIVER")
public class Driver extends User {
}
