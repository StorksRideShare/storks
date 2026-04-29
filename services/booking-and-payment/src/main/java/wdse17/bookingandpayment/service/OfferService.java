package wdse17.bookingandpayment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import wdse17.bookingandpayment.dto.OfferDTO;
import wdse17.bookingandpayment.entity.Offer;
import wdse17.bookingandpayment.entity.Asset;
import wdse17.bookingandpayment.repository.OfferRepository;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
public class OfferService {

        @Autowired
        private OfferRepository offerRepository;

        public List<OfferDTO> getAllOffers() {
                return offerRepository.findAll().stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        public OfferDTO getOfferById(java.util.UUID id) {
                return offerRepository.findById(id)
                                .map(this::mapToDTO)
                                .orElseThrow(() -> new RuntimeException("Offer not found"));
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        private OfferDTO mapToDTO(Offer offer) {
                String driverName = offer.getDriver().getUser().getFirstName() + " "
                                + offer.getDriver().getUser().getLastName();

                List<String> imageUrls = offer.getVehicle().getAssets().stream()
                                .map(Asset::getAssetUrl)
                                .collect(Collectors.toList());

                List<String> destNames = offer.getDestinations().stream()
                                .map(loc -> loc.getNickname() != null ? loc.getNickname() : loc.getAddress())
                                .collect(Collectors.toList());

                return OfferDTO.builder()
                                .offerId(offer.getOfferId())
                                .driverName(driverName)
                                .vehicleName(offer.getVehicle().getNickname())
                                .plate(offer.getVehicle().getLicensePlate())
                                .pricePerMonth(offer.getPricePerMonth())
                                .pricePerDay(offer.getPricePerDay())
                                .seats(14)
                                .capacity(10)
                                .features(Arrays.asList("Air Condition", "New Vehicle", "CCTV"))
                                .vehicleImageUrls(imageUrls)
                                .rating("4.8 Rated")
                                .experience("5 Years")
                                .trips("+500")
                                .bookedGroupName(offer.getDriver().getUser().getFirstName().equals("Ranidu") ? "Loku"
                                                : null)
                                .destinations(destNames)
                                .isUsingIntelligentPricing(offer.getIsUsingIntelligentPricing())
                                .build();
        }
}
