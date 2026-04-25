package com.storks.models;

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
    @Column(nullable = false)
    private String countryCode;
    @Column(nullable = false)
    private String number;
    @Column(name = "is_primary")
    private Boolean primary = false;

    public Boolean isPrimary() {
        return primary;
    }
    @Column(name = "is_validated")
    private Boolean isValidated = false;

    public Boolean isValidated() {
        return isValidated;
    }
    @CreationTimestamp
    private LocalDateTime addedAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public PhoneNumber() {}

    public PhoneNumber(String countryCode, String number) {
        this.countryCode = countryCode;
        this.number = number;
    }

    public PhoneNumber(String countryCode, String number, Boolean primary) {
        this.countryCode = countryCode;
        this.number = number;
        this.primary = primary;
    }
}
