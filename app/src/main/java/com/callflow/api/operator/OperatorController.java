package com.callflow.api.operator;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/operators")
public class OperatorController {

    private final OperatorService operatorService;

    public OperatorController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    @GetMapping
    public List<Operator> getAll(Authentication authentication) {
        return operatorService.getAll(authentication.getName());
    }

    @GetMapping("/{id}")
    public Operator getById(@PathVariable Long id, Authentication authentication) {
        return operatorService.getById(authentication.getName(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Operator create(@RequestBody Operator operator, Authentication authentication) {
        return operatorService.create(authentication.getName(), operator);
    }

    @PatchMapping("/{id}/status")
    public Operator updateStatus(@PathVariable Long id, @RequestParam OperatorStatus status, Authentication authentication) {
        return operatorService.updateStatus(authentication.getName(), id, status);
    }

    @GetMapping("/{id}/status/cached")
    public String getCachedStatus(@PathVariable Long id, Authentication authentication) {
        return operatorService.getCachedStatus(authentication.getName(), id);
    }
}
