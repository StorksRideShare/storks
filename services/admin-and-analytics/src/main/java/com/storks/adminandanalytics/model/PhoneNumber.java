package com.storks.adminandanalytics.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Embeddable
@Getter
@Setter
public class PhoneNumber {

    private String countryCode;
    private String number;

    // Renamed from 'primary' — reserved keyword in PostgreSQL
    @Column(name = "is_primary")
    private Boolean isPrimaryContact;

    @Column(name = "is_validated")
    private Boolean validated;

    @CreationTimestamp
    private LocalDateTime addedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public PhoneNumber() {}

    public PhoneNumber(String countryCode, String number) {
        this.countryCode = countryCode;
        this.number = number;
        this.isPrimaryContact = false;
        this.validated = false;
    }

    public PhoneNumber(String countryCode, String number, boolean isPrimaryContact) {
        this.countryCode = countryCode;
        this.number = number;
        this.isPrimaryContact = isPrimaryContact;
        this.validated = false;
    }

    public String getFullNumber() {
        return countryCode + number;
    }
}