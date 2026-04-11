package com.storks.models.dto;

import java.io.Serializable;

public record UserAuthResponse(boolean isBanned, boolean isOnboarded, String userId, String role) implements Serializable {}
