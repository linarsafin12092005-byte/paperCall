package com.callflow.api.service;

import com.callflow.api.dto.CallResponse;
import com.callflow.api.model.Call;
import com.callflow.api.repository.CallRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CallService {

    private final CallRepository callRepository;

    public CallService(CallRepository callRepository) {
        this.callRepository = callRepository;
    }

    public CallResponse create(Call call) {
        Call savedCall = callRepository.save(call);
        return toResponse(savedCall);
    }

    public List<CallResponse> getAll() {
        return callRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CallResponse getById(Long id) {
        Call call = callRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Call not found: " + id));

        return toResponse(call);
    }

    public CallResponse update(Long id, Call updatedCall) {
        Call call = callRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Call not found: " + id));

        call.setPhone(updatedCall.getPhone());
        call.setOperator(updatedCall.getOperator());
        call.setStatus(updatedCall.getStatus());

        return toResponse(callRepository.save(call));
    }

    public void delete(Long id) {
        if (!callRepository.existsById(id)) {
            throw new RuntimeException("Call not found: " + id);
        }

        callRepository.deleteById(id);
    }

    private CallResponse toResponse(Call call) {
        return new CallResponse(
                call.getId(),
                call.getPhone(),
                call.getOperator(),
                call.getStatus()
        );
    }
}
