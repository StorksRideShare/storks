package com.storks.livemessaging.model;

import com.storks.livemessaging.model.types.LegType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "ride_legs")
public class RideLeg {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id")
    private Ride ride;

    @Enumerated
    private LegType type;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}