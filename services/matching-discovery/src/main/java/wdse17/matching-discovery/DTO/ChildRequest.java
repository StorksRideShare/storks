package wdse17.matching.discovery.dto;

import lombok.*;

@Data
public class ChildRequest {
    private String name;
    private int age;
    private String pickupLocation;
    private String dropLocation;
}