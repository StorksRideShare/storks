package wdse17.bookingandpayment.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import wdse17.bookingandpayment.dto.CardDTO;
import wdse17.bookingandpayment.service.CardService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "*")
public class CardController {

    @Autowired
    private CardService cardService;

    @GetMapping("/parent/{parentId}")
    public List<CardDTO> getSavedCards(@PathVariable UUID parentId) {
        return cardService.getSavedCards(parentId);
    }

    @PostMapping("/parent/{parentId}")
    public CardDTO addCard(@PathVariable UUID parentId, @RequestBody CardDTO request) {
        return cardService.saveCard(parentId, request);
    }
}
