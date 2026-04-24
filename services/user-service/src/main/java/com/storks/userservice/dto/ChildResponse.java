package com.storks.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChildResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String preferredName;
    private String grade;
    private String schoolName;
    private String pronouns;
    private String parentId;
    private String groupId;
}
