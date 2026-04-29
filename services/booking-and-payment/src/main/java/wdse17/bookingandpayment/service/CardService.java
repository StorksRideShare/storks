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
        // Card Holder Name (only characters and spaces)
        if (request.getCardHolderName() == null || !request.getCardHolderName().trim().matches("^[a-zA-Z\\s]+$")) {
            throw new RuntimeException("Validation Error: Card holder name must contain only letters and spaces.");
        }

        // Card Number (exactly 16 digits)
        String rawNumber = request.getCardNumber() != null ? request.getCardNumber().replaceAll("\\s+", "") : "";
        if (!rawNumber.matches("^\\d{16}$")) {
            throw new RuntimeException("Validation Error: Card number must be exactly 16 digits.");
        }

        // CVV (exactly 3 digits)
        String cvv = request.getCvv();
        if (cvv == null || !cvv.matches("^\\d{3}$")) {
            throw new RuntimeException("Validation Error: CVV must be exactly 3 digits.");
        }

        // Expiry Date (Format MM/YY and logic)
        String expiry = request.getExpiry();
        if (expiry == null || !expiry.matches("^(0[1-9]|1[0-2])/\\d{2}$")) {
            throw new RuntimeException("Validation Error: Please enter a valid expiry date (MM/YY).");
        }

        try {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("MM/yy");
            java.time.YearMonth expiryDate = java.time.YearMonth.parse(expiry, formatter);
            java.time.YearMonth currentMonth = java.time.YearMonth.now();

            if (expiryDate.isBefore(currentMonth)) {
                throw new RuntimeException("Validation Error: The card has already expired.");
            }
        } catch (java.time.format.DateTimeParseException e) {
            throw new RuntimeException("Validation Error: Invalid expiry date format.");
        }

        String last4 = rawNumber.substring(rawNumber.length() - 4);

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
