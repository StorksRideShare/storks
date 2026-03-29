package com.storks.security;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storks.entity.AuditLog;
import com.storks.repository.AuditLogRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(3)   // after JwtAuthenticationFilter (usually order ~1–2)
public class AuditLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AuditLoggingFilter.class);

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final JwtUtil jwtUtil;

    public AuditLoggingFilter(AuditLogRepository auditLogRepository,
                              ObjectMapper objectMapper,
                              JwtUtil jwtUtil) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        filterChain.doFilter(request, response);

        long duration = System.currentTimeMillis() - startTime;

        try {
            UUID userId = extractUserIdFromRequest(request);

            AuditLog audit = new AuditLog();
            audit.setUserId(userId);
            audit.setMethod(request.getMethod());
            audit.setEndpoint(request.getRequestURI());
            audit.setAction(request.getMethod() + " " + request.getRequestURI());
            audit.setIpAddress(getClientIp(request));
            audit.setStatus(response.getStatus());

            Map<String, Object> details = new HashMap<>();
            details.put("query", request.getQueryString());
            details.put("userAgent", request.getHeader("User-Agent"));
            details.put("durationMs", duration);

            try {
                audit.setDetails(objectMapper.writeValueAsString(details));
            } catch (Exception e) {
                audit.setDetails("{\"error\":\"details serialization failed\"}");
            }

            // For better performance in production → move to @Async or event publisher
            auditLogRepository.save(audit);

            log.info("AUDIT | {} {} | {} | user={} | ip={} | {}ms",
                    request.getMethod(), request.getRequestURI(), response.getStatus(),
                    userId != null ? userId : "anonymous", audit.getIpAddress(), duration);

        } catch (Exception e) {
            log.error("Audit logging failed", e);
        }
    }

    private UUID extractUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        try {
            return jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}