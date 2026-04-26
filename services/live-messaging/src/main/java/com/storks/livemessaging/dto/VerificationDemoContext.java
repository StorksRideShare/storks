package com.storks.livemessaging.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record VerificationDemoContext(
    @JsonProperty("groupId") UUID groupId,
    @JsonProperty("rideId") UUID rideId,
    @JsonProperty("childId") UUID childId,
    @JsonProperty("childName") String childName
) {}
