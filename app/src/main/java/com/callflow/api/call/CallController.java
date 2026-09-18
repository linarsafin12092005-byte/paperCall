package com.callflow.api.call;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/calls")
public class CallController {

    private final CallService callService;

    public CallController(CallService callService) {
        this.callService = callService;
    }

    @GetMapping
    public List<CallResponse> getAll(Authentication authentication) {
        return callService.getAll(authentication.getName()).stream().map(CallResponseMapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    public CallResponse getById(@PathVariable Long id, Authentication authentication) {
        return CallResponseMapper.toResponse(callService.getByIdForActor(authentication.getName(), id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CallResponse create(@Valid @RequestBody CallRequest request, Authentication authentication) {
        return CallResponseMapper.toResponse(callService.create(authentication.getName(), request));
    }

    @PatchMapping("/{id}/status")
    public CallResponse updateStatus(@PathVariable Long id, @RequestParam CallStatus status, Authentication authentication) {
        return CallResponseMapper.toResponse(callService.updateStatus(authentication.getName(), id, status));
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
