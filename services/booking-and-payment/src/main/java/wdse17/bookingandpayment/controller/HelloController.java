package wdse17.bookingandpayment.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String home() {
        return "<h1>App is running</h1>";
    }

    @GetMapping("/hello")
    public String hello() {
        return "<h1>Hello, World!</h1>";
    }
}