package com.callflow.api.controller;

import com.callflow.api.dto.CallResponse;
import com.callflow.api.model.Call;
import com.callflow.api.service.CallService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calls")
public class CallController {

    private final CallService callService;

    public CallController(CallService callService) {
        this.callService = callService;
    }

    @PostMapping
    public ResponseEntity<CallResponse> createCall(@RequestBody Call call) {
        return ResponseEntity.ok(callService.create(call));
    }

    @GetMapping
    public List<CallResponse> getCalls() {
        return callService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CallResponse> getCall(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(callService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CallResponse> updateCall(
            @PathVariable Long id,
            @RequestBody Call call
    ) {
        try {
            return ResponseEntity.ok(callService.update(id, call));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCall(@PathVariable Long id) {
        try {
            callService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
