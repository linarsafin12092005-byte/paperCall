package com.callflow.api.asterisk;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/telephony")
public class TelephonyStatusController {
    private final TelephonyStatusService statusService;

    public TelephonyStatusController(TelephonyStatusService statusService) {
        this.statusService = statusService;
    }

    @GetMapping("/status")
    public Map<String, Boolean> status() {
        return Map.of(
                "enabled", statusService.isEnabled(),
                "connected", statusService.isConnected()
        );
    }
}
