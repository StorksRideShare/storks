package com.storks.matching.controller;

import java.util.UUID;
import com.storks.matching.dto.GroupResponse;
import com.storks.matching.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
@CrossOrigin
public class GroupController {

    private final GroupService groupService;

    @GetMapping("/{id}")
    public GroupResponse getGroup(@PathVariable UUID id) {
        return groupService.getGroup(id);
    }
}


