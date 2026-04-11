package com.storks.matching.controller;

import java.util.UUID;
import com.storks.matching.dto.*;
import com.storks.matching.service.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
@CrossOrigin
public class ChildController {

    private final ChildService childService;

    // ✅ Add child
    @PostMapping("/{groupId}/children")
    public void addChild(
            @PathVariable UUID groupId,
            @RequestBody ChildRequest request
    ) {
        childService.addChild(groupId, request);
    }

    // ✅ Get children
    @GetMapping("/{groupId}/children")
    public List<ChildResponse> getChildren(@PathVariable UUID groupId) {
        return childService.getChildren(groupId);
    }
}


