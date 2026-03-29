package com.storks.livemessaging.dto.events;

import java.util.UUID;

public record OfferCreatedEvent(UUID offerId, UUID driverId) {}
