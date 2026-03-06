package wdse17.saftyandverification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import wdse17.saftyandverification.model.OtpPin;
import wdse17.saftyandverification.repository.OTPRepository;
import wdse17.saftyandverification.utils.PinGenerator;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Objects;
import java.util.Optional;

@RestController
public class DispatchPinController {
    private final PinGenerator pinGenerator = new PinGenerator();
    private final OTPRepository otpRepository;

    public DispatchPinController(OTPRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    @GetMapping("/test123")
    public String test123() {
        return "hello";
    }

    @GetMapping("/api/v1/pin/{user}/request")
    public ResponseEntity<HashMap<String, String>> ping(@PathVariable String user) {
        OtpPin pin = new OtpPin(user);
        pin.setOtpPin(pinGenerator.generateOtp());

        HashMap<String, String> map = new HashMap<String, String>();
        map.put("user", user);
        map.put("pin", pin.getOtpPin());
        map.put("status", "OK" );
        map.put("timestamp", String.valueOf(System.currentTimeMillis()));

        otpRepository.save(pin);
        return ResponseEntity.ok(map);
    }

    @GetMapping("/api/v1/pin/{user}/verify/{parent}")
    public ResponseEntity<HashMap<String, String>> verifyPin(@PathVariable String user, @PathVariable String parent, @RequestParam String pin) {
        Optional<OtpPin> otpOp = otpRepository.findByOtpPinAndParentId(pin, parent);

        if (otpOp.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        OtpPin otp = otpOp.get();

        otp.setDriverId(user);
        otp.setVerifiedTime(LocalDateTime.now());
        otpRepository.save(otp);

        HashMap<String, String> map = new HashMap<>();
        map.put("status", "OK");
        map.put("verified", "true");
        map.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        return ResponseEntity.ok(map);
    }
}
