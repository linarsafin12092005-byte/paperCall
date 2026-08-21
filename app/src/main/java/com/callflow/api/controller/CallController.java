package com.callflow.api.controller;

import com.callflow.api.model.Call;
import com.callflow.api.repository.CallRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calls")
public class CallController {

    private final CallRepository callRepository;

    public CallController(CallRepository callRepository) {
        this.callRepository = callRepository;
    }

    @PostMapping
    public Call createCall(@RequestBody Call call) {
        return callRepository.save(call);
    }

    @GetMapping
    public List<Call> getCalls() {
        return callRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Call> getCall(@PathVariable Long id) {
        return callRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
