package com.storks.livemessaging.dto.events;

import java.util.UUID;

public record BookingEvent(UUID offerId, UUID parentId) {}
