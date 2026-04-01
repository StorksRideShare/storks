package com.storks.common.dto;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    void success_CreatesValidResponse() {
        String data = "Hello World";
        ApiResponse<String> response = ApiResponse.success(data);

        assertTrue(response.isSuccess());
        assertEquals(data, response.getData());
        assertNotNull(response.getTimestamp());
        assertEquals("Operation successful", response.getMessage());
    }

    @Test
    void error_CreatesValidResponse() {
        String message = "Something went wrong";
        ApiResponse<?> response = ApiResponse.error(message);

        assertFalse(response.isSuccess());
        assertNull(response.getData());
        assertEquals(message, response.getMessage());
    }
}
