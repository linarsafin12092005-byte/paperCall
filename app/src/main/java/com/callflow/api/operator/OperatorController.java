package com.callflow.api.operator;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operators")
public class OperatorController {

    private final OperatorService operatorService;

    public OperatorController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    @GetMapping
    public List<Operator> getAll() {
        return operatorService.getAll();
    }

    @GetMapping("/{id}")
    public Operator getById(@PathVariable Long id) {
        return operatorService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Operator create(@RequestBody Operator operator) {
        return operatorService.create(operator);
    }

    @PatchMapping("/{id}/status")
    public Operator updateStatus(@PathVariable Long id, @RequestParam OperatorStatus status) {
        return operatorService.updateStatus(id, status);
    }

    @GetMapping("/{id}/status/cached")
    public String getCachedStatus(@PathVariable Long id) {
        return operatorService.getCachedStatus(id);
    }
}
