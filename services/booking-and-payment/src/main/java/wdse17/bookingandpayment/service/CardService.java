package wdse17.bookingandpayment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import wdse17.bookingandpayment.dto.CardDTO;
import wdse17.bookingandpayment.entity.Card;
import wdse17.bookingandpayment.repository.CardRepository;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CardService {

    @Autowired
    private CardRepository cardRepository;

    public List<CardDTO> getSavedCards(UUID parentId) {
        return cardRepository.findByParentIdAndActiveTrue(parentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private String hashCardNumber(String cardNumber) {
        // check card number has at least 12 digits
        if (cardNumber == null || cardNumber.replaceAll("\\s+", "").length() < 12) {
            throw new RuntimeException("Validation Error: Card number must be at least 12 digits long.");
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(cardNumber.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash card number", e);
        }
    }

    public CardDTO saveCard(UUID parentId, CardDTO request) {
        // check card holder name
        if (request.getCardHolderName() == null || request.getCardHolderName().trim().isEmpty()) {
            throw new RuntimeException("Validation Error: Card holder name is required.");
        }

        String rawNumber = request.getCardNumber().replaceAll("\\s+", "");
        String last4 = rawNumber.length() >= 4 ? rawNumber.substring(rawNumber.length() - 4) : rawNumber;

        //
        String securedData = hashCardNumber(rawNumber) + ":" + last4;

        Card card = Card.builder()
                .cardId(UUID.randomUUID())
                .cardNumber(securedData)
                .cardHolderName(request.getCardHolderName())
                .active(true)
                .isPrimary(true) // Just defaulting to true for the new inserted card
                .parentId(parentId)
                .build();
        card = cardRepository.save(card);

        return mapToDTO(card);
    }

    private CardDTO mapToDTO(Card card) {
        String data = card.getCardNumber();
        String last4 = "0000";

        if (data != null && data.contains(":")) {
            last4 = data.split(":")[1];
        } else if (data != null) {
            // fallback for any raw legacy data during development
            last4 = data.length() >= 4 ? data.substring(data.length() - 4) : data;
        }

        String obfuscated = "**** **** **** " + last4;

        return CardDTO.builder()
                .cardId(card.getCardId())
                .cardNumber(obfuscated)
                .cardHolderName(card.getCardHolderName())
                .isPrimary(card.getIsPrimary())
                .build();
    }
}
