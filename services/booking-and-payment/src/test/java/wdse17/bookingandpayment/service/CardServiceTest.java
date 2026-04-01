package wdse17.bookingandpayment.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import wdse17.bookingandpayment.dto.CardDTO;
import wdse17.bookingandpayment.entity.Card;
import wdse17.bookingandpayment.repository.CardRepository;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @InjectMocks
    private CardService cardService;

    private UUID parentId;
    private CardDTO validCardRequest;

    @BeforeEach
    void setUp() {
        parentId = UUID.randomUUID();
        // Setup a basic, valid card request
        validCardRequest = new CardDTO();
        validCardRequest.setCardNumber("1234 5678 1234 5678");
        validCardRequest.setCardHolderName("John Doe");
    }

    @Test
    void testSaveCard_Success() {
        // Arrange (Setup the expected database result)
        Card savedCard = new Card();
        savedCard.setCardId(UUID.randomUUID());
        savedCard.setCardNumber("hash:5678");
        savedCard.setCardHolderName("John Doe");
        savedCard.setIsPrimary(true);
        savedCard.setParentId(parentId);
        
        when(cardRepository.save(any(Card.class))).thenReturn(savedCard);

        // Act (Execute the logic in our service)
        CardDTO result = cardService.saveCard(parentId, validCardRequest);

        // Assert (Verify the output is exactly what we expect)
        assertNotNull(result, "Result should not be null");
        assertEquals("John Doe", result.getCardHolderName(), "Card holder name must match");
        assertTrue(result.getCardNumber().contains("5678"), "Card number should be properly obfuscated with last 4 digits");
    }

    @Test
    void testSaveCard_FailsWhenHolderNameIsMissing() {
        // Arrange
        validCardRequest.setCardHolderName("");

        // Act & Assert (Verify that a RuntimeException is thrown because of our validation rule)
        Exception exception = assertThrows(RuntimeException.class, () -> {
            cardService.saveCard(parentId, validCardRequest);
        });

        // Ensure the exception message matches the validation comment we provided
        assertTrue(exception.getMessage().contains("Card holder name is required"));
    }

    @Test
    void testSaveCard_FailsWhenCardNumberIsTooShort() {
        // Arrange
        validCardRequest.setCardNumber("1234"); // only 4 digits, below our 12 digit minimum

        // Act & Assert (Verify validation rule triggers exception)
        Exception exception = assertThrows(RuntimeException.class, () -> {
            cardService.saveCard(parentId, validCardRequest);
        });

        assertTrue(exception.getMessage().contains("must be at least 12 digits long"));
    }
}
