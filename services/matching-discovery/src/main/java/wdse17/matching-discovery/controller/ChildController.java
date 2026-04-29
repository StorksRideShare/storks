package wdse17.matching.discovery.controller;

import wdse17.matching.discovery.dto.*;
import wdse17.matching.discovery.service.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin
public class ChildController {

    private final ChildService childService;

    // ✅ Add child
    @PostMapping("/{groupId}/children")
    public void addChild(
            @PathVariable Long groupId,
            @RequestBody ChildRequest request
    ) {
        childService.addChild(groupId, request);
    }

    // ✅ Get children
    @GetMapping("/{groupId}/children")
    public List<ChildResponse> getChildren(@PathVariable Long groupId) {
        return childService.getChildren(groupId);
    }
}