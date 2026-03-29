package com.storks.views;

// Marker interfaces for different visibility levels
public class UserViews {

    // Minimal view: used for DRIVER role (e.g. only name, no address/medical)
    public interface DriverView {}

    // Standard view: used for PARENT role (more details about own children)
    public interface ParentView extends DriverView {}

    // Full view: used for ADMIN role (everything)
    public interface AdminView extends ParentView {}
}