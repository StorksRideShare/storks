package com.storks.security;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import com.storks.views.UserViews;

@RestControllerAdvice
public class MaskingAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true; // apply to all
    }

    @Override
    public Object beforeBodyWrite(Object body,
                                  MethodParameter returnType,
                                  MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request,
                                  ServerHttpResponse response) {

        if (body == null) return null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return body; // or throw
        }

        String highestRole = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .max(String::compareTo)  // ADMIN > PARENT > DRIVER
                .orElse("GUEST");

        Class<?> view;
        if ("ADMIN".equals(highestRole)) {
            view = UserViews.AdminView.class;
        } else if ("PARENT".equals(highestRole)) {
            view = UserViews.ParentView.class;
        } else {
            view = UserViews.DriverView.class;
        }

        // This requires object mapper config to respect view — or use manual serialization (complex)
        // Simplest: return body as-is and rely on controller @JsonView
        return body;
    }
}