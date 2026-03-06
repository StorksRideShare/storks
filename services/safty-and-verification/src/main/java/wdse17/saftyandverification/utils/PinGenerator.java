package wdse17.saftyandverification.utils;

import java.util.Random;

public class PinGenerator {
    private static final int OTP_EXPIRY_MINUTES = 15;
    private static final Random RANDOM = new Random();

    public String generateOtp() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
