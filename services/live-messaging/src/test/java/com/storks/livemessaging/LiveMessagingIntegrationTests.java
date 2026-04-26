package com.storks.livemessaging;

import com.storks.models.ChatRoom;
import com.storks.models.Message;
import com.storks.models.User;
import com.storks.livemessaging.service.ChatRoomService;
import com.storks.livemessaging.service.MessageService;
import com.storks.livemessaging.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
@AutoConfigureMockMvc
@EmbeddedKafka(partitions = 1, topics = {"chat-messages"})
public class LiveMessagingIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChatRoomService chatRoomService;

    @MockBean
    private MessageService messageService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private org.springframework.security.oauth2.jwt.JwtDecoder jwtDecoder;

    @MockBean
    private com.storks.common.auth.UserAuthService userAuthService;

    private final UUID testUserId = UUID.randomUUID();
    private final UUID targetUserId = UUID.randomUUID();
    private final UUID roomId = UUID.randomUUID();

    @DynamicPropertySource
    static void kafkaProperties(DynamicPropertyRegistry registry) {
        // Intentionally empty — @EmbeddedKafka auto-overrides spring.kafka.bootstrap-servers
        // when no port is hardcoded, ensuring no conflict with external brokers.
    }

    @BeforeEach
    void setUp() {
        // Setup mock UserAuthService
        Mockito.when(userAuthService.getUserAuthClaim(any(String.class), any(), any(), any(), any()))
               .thenReturn(new com.storks.models.dto.UserAuthClaim("test_sub", "test@example.com", true, testUserId, "PARENT"));

        // Setup mock user
        User mockUser = Mockito.mock(User.class);
        Mockito.when(mockUser.getUserId()).thenReturn(targetUserId);
        Mockito.when(mockUser.getFirstName()).thenReturn("Test");
        Mockito.when(mockUser.getLastName()).thenReturn("User");
        Mockito.when(mockUser.getEmail()).thenReturn("test@example.com");

        Mockito.when(userRepository.searchByEmailOrId(any(String.class)))
               .thenReturn(Collections.singletonList(mockUser));

        // Setup mock chat room
        ChatRoom mockRoom = new ChatRoom();
        mockRoom.setRoomId(roomId);
        mockRoom.setCreatedAt(java.time.OffsetDateTime.now());
        
        com.storks.livemessaging.dto.ChatRoomResponse mockRoomResponse = 
            new com.storks.livemessaging.dto.ChatRoomResponse(
                roomId, 
                com.storks.models.types.RoomType.DIRECT, 
                Collections.emptyList(), 
                java.time.OffsetDateTime.now(), 
                java.time.OffsetDateTime.now(), 
                "Hello", 
                java.time.OffsetDateTime.now()
            );

        Mockito.when(chatRoomService.createOrRestoreDirectRoom(any(UUID.class), any(UUID.class)))
               .thenReturn(mockRoom);
               
        Mockito.when(chatRoomService.toResponse(any(ChatRoom.class)))
               .thenReturn(mockRoomResponse);

        Mockito.when(chatRoomService.getUserActiveRooms(any(UUID.class)))
               .thenReturn(List.of(mockRoom));

        Mockito.when(chatRoomService.getRoomDetail(any(UUID.class)))
               .thenReturn(mockRoomResponse);

        // Setup mock messages
        com.storks.livemessaging.dto.ChatMessagePayload msg = new com.storks.livemessaging.dto.ChatMessagePayload();
        msg.setMessageId(UUID.randomUUID());
        msg.setRoomId(roomId);
        msg.setSenderId(testUserId);
        msg.setContent("Hello");
        msg.setType(com.storks.models.types.MessageType.CHAT);
        msg.setSentAt(java.time.OffsetDateTime.now());
        msg.setReadBy(Collections.emptyList());
        Mockito.when(messageService.getMessageHistory(any(UUID.class), any(Pageable.class)))
               .thenReturn(new PageImpl<>(List.of(msg), PageRequest.of(0, 50), 1));
    }

    private org.springframework.security.core.Authentication createMockAuthentication() {
        com.storks.models.dto.UserAuthClaim claim = new com.storks.models.dto.UserAuthClaim("test_sub", "test@example.com", true, testUserId, "PARENT");
        return new com.storks.common.auth.UserAuthClaimToken(
                claim,
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_PARENT"))
        );
    }

    @Test
    @DisplayName("1. Health Check Validation")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/health"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("2. Unauthorized Access Returns 401")
    void testUnauthorizedAccess() throws Exception {
        // No SecurityMockMvcRequestPostProcessors.jwt() attached
        mockMvc.perform(get("/api/v1/chats"))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("3. Search Users by Query Returns Results")
    void testSearchUsersByQuery() throws Exception {
        mockMvc.perform(get("/api/v1/users/search?q=test")
                .with(SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication())))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(targetUserId.toString()));
    }

    @Test
    @DisplayName("4. Search Non-existent User Returns Empty List")
    void testSearchNonExistentUser() throws Exception {
        Mockito.when(userRepository.searchByEmailOrId("unknown"))
               .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/users/search?q=unknown")
                .with(SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication())))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @DisplayName("5. Create Chat Room with Valid Target")
    void testCreateChatRoomValidTarget() throws Exception {
        String payload = "{\"targetUserId\":\"" + targetUserId.toString() + "\"}";

        mockMvc.perform(post("/api/v1/chats")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
                .with(SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication())))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(roomId.toString()));
    }

    @Test
    @DisplayName("6. Create Chat Room with Invalid Target Error Handling")
    void testCreateChatRoomInvalidTarget() throws Exception {
        Mockito.when(userRepository.searchByEmailOrId("invalid-id"))
               .thenReturn(Collections.emptyList());

        String payload = "{\"targetUserId\":\"invalid-id\"}";

        mockMvc.perform(post("/api/v1/chats")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
                .with(SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication())))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Or whatever status your exception handler maps IllegalArgumentException to.
    }

    @Test
    @DisplayName("7. Get User's Active Chats")
    void testGetUserActiveChats() throws Exception {
        mockMvc.perform(get("/api/v1/chats")
                .with(SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication())))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roomId").value(roomId.toString()));
    }

    @Test
    @DisplayName("8. Get Specific Room Details")
    void testGetSpecificRoomDetails() throws Exception {
        mockMvc.perform(get("/api/v1/chats/" + roomId.toString())
                .with(SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication())))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(roomId.toString()));
    }

    @Test
    @DisplayName("9. Fetch Room Messages")
    void testFetchRoomMessages() throws Exception {
        mockMvc.perform(get("/api/v1/chats/" + roomId.toString() + "/messages")
                .with(SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication())))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].content").value("Hello"));
    }

    @Test
    @DisplayName("10. Fetch Room Messages with Pagination Params")
    void testFetchRoomMessagesPagination() throws Exception {
        mockMvc.perform(get("/api/v1/chats/" + roomId.toString() + "/messages?page=1&size=5")
                .with(SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication())))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].content").value("Hello"));
    }
}
