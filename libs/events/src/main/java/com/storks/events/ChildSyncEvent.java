package com.storks.events;

import com.storks.models.types.SchoolGrade;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ChildSyncEvent extends BaseEvent {
    private UUID childId;
    private UUID parentId;
    private String firstName;
    private String lastName;
    private String preferredName;
    private SchoolGrade grade;
    private String qrHash;
}
