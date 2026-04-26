package com.storks.livemessaging;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;

import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
@EmbeddedKafka(partitions = 1)
class LiveMessagingApplicationTests {

    @MockBean
    private org.springframework.security.oauth2.jwt.JwtDecoder jwtDecoder;

    @Test
    void contextLoads() {
    }

}
