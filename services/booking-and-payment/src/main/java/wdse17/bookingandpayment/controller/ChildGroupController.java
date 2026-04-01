package wdse17.bookingandpayment.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import wdse17.bookingandpayment.dto.ChildGroupDTO;
import wdse17.bookingandpayment.service.ChildGroupService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/child-groups")
public class ChildGroupController {

    @Autowired
    private ChildGroupService childGroupService;

    // Temporary endpoint using hardcoded parent ID by default if not provided
    @GetMapping
    public List<ChildGroupDTO> getChildGroups(@RequestParam(required = false) UUID parentId) {
        UUID effectiveParentId = (parentId != null) ? parentId : UUID.fromString("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01");
        return childGroupService.getChildGroupsByParent(effectiveParentId);
    }
}
