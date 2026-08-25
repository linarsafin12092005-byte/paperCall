package com.callflow.api.operator;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperatorService {

    private final OperatorRepository operatorRepository;

    public OperatorService(OperatorRepository operatorRepository) {
        this.operatorRepository = operatorRepository;
    }

    public List<Operator> getAll() {
        return operatorRepository.findAll();
    }

    public Operator getById(Long id) {
        return operatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator not found: " + id));
    }

    public Operator create(Operator operator) {
        return operatorRepository.save(operator);
    }
}
