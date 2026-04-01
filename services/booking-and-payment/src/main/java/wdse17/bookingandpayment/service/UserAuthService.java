package wdse17.bookingandpayment.service;

import wdse17.bookingandpayment.dto.UserAuthClaim;
import wdse17.bookingandpayment.entity.User;
import wdse17.bookingandpayment.errors.InvalidUserIdException;
import wdse17.bookingandpayment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserAuthService {
    private final UserRepository userRepository;

    @Cacheable(value = "userClaims", key = "#providerUserId")
    public UserAuthClaim getUserById(String providerUserId) throws IllegalArgumentException, InvalidUserIdException {
        try {
            return userRepository.findByProviderUserId(providerUserId)
                    .map(this::toUserAuthClaim)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidUserIdException("Invalid user ID format " + providerUserId);
        }
    }

    private UserAuthClaim toUserAuthClaim(User user) {
        return new UserAuthClaim(user.getProviderUserId(), user.getEmail(), user.isDeleted(), user.getUserId());
    }
}
