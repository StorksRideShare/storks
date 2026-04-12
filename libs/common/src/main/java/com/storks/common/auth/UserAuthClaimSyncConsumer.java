package com.storks.common.auth;

import com.storks.events.UserSyncEvent;
import com.storks.models.dto.UserAuthClaim;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserAuthClaimSyncConsumer {

    private final CacheManager cacheManager;

    @KafkaListener(topics = "storks.users.sync", groupId = "${spring.application.name}-auth-sync")
    public void handleUserSync(UserSyncEvent event) {
        log.debug("Received UserSyncEvent for providerUserId: {}", event.getProviderUserId());
        
        Cache cache = cacheManager.getCache("user_auth_claims");
        if (cache != null) {
            UserAuthClaim claim = new UserAuthClaim(
                    event.getProviderUserId(),
                    event.getEmail(),
                    event.isDeleted() || event.isBanned(), 
                    event.getUserId(),
                    event.getRole() != null ? event.getRole().name() : "PARENT"
            );
            
            // Pre-warm the cache for all services
            cache.put(event.getProviderUserId(), claim);
            log.info("Pre-warmed auth cache for user: {}", event.getProviderUserId());
        }
    }
}
