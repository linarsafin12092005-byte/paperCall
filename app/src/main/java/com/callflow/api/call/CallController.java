package com.callflow.api.call;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calls")
public class CallController {

    private final CallService callService;

    public CallController(CallService callService) {
        this.callService = callService;
    }

    @GetMapping
    public List<Call> getAll() {
        return callService.getAll();
    }

    @GetMapping("/{id}")
    public Call getById(@PathVariable Long id) {
        return callService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Call create(@RequestParam Long clientId) {
        return callService.createForClient(clientId);
    }

    @PostMapping("/{id}/assign")
    public Call assignOperator(@PathVariable Long id, @RequestParam Long operatorId) {
        return callService.assignOperator(id, operatorId);
    }

    @PostMapping("/{id}/finish")
    public Call finish(@PathVariable Long id) {
        return callService.finish(id);
    }
}
