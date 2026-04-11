package com.storks.livemessaging.dto;

public class CreateChatRequest {
    private String targetUserId; // accepts DB UUID, provider UUID, or email

    public CreateChatRequest() {}

    public String getTargetUserId() { return targetUserId; }
    public void setTargetUserId(String targetUserId) { this.targetUserId = targetUserId; }
}


