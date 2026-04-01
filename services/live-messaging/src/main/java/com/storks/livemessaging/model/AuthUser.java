package com.storks.livemessaging.model;

public interface AuthUser {
    String getProviderUserId();
    String getEmail();
    Boolean getIsDeleted();
    java.util.UUID getUserId();
}
