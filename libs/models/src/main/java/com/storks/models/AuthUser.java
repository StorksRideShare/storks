package com.storks.models;

public interface AuthUser {
    String getProviderUserId();
    String getEmail();
    Boolean getIsDeleted();
    java.util.UUID getUserId();
}
