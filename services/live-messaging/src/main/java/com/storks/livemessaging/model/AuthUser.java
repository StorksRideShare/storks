package com.storks.livemessaging.model;

public interface AuthUser {
    String getProviderUserId();
    String getEmail();
    boolean isDeleted();
}
