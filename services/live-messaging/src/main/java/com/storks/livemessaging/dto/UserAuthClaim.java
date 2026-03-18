package com.storks.livemessaging.dto;

public record UserAuthClaim(String userId, String email, boolean isDeleted) {}
