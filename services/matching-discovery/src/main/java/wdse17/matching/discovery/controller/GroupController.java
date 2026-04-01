package wdse17.matching.discovery.controller;

import wdse17.matching.discovery.dto.GroupResponse;
import wdse17.matching.discovery.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin
public class GroupController {

    private final GroupService groupService;

    @GetMapping("/{id}")
    public GroupResponse getGroup(@PathVariable Long id) {
        return groupService.getGroup(id);
    }
}