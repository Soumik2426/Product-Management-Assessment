package com.Assessment.product_management_api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("test")
public class TestController {
    @GetMapping("/jwtcheck")
    public Map<String, String> test() {
        return Map.of(
                "message",
                "JWT Authentication Working"
        );
    }
}
