package com.storks.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class StorksException extends RuntimeException {
    private final HttpStatus status;
    private final String message;

    public StorksException(String message, HttpStatus status) {
        super(message);
        this.message = message;
        this.status = status;
    }

    public static StorksException badRequest(String message) {
        return new StorksException(message, HttpStatus.BAD_REQUEST);
    }

    public static StorksException notFound(String message) {
        return new StorksException(message, HttpStatus.NOT_FOUND);
    }

    public static StorksException unauthorized(String message) {
        return new StorksException(message, HttpStatus.UNAUTHORIZED);
    }

    public static StorksException internalError(String message) {
        return new StorksException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
