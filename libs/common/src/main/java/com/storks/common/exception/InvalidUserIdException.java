package com.storks.common.exception;

import org.springframework.http.HttpStatus;

public class InvalidUserIdException extends StorksException {
    public InvalidUserIdException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
