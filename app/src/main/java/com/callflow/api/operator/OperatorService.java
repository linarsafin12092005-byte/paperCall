package com.callflow.api.operator;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperatorService {

    private static final String STATUS_KEY_PREFIX = "operator:status:";

    private final OperatorRepository operatorRepository;
    private final RedisTemplate<String, String> redisTemplate;

    public OperatorService(OperatorRepository operatorRepository,
                            RedisTemplate<String, String> redisTemplate) {
        this.operatorRepository = operatorRepository;
        this.redisTemplate = redisTemplate;
    }

    public List<Operator> getAll() {
        return operatorRepository.findAll();
    }

    public Operator getById(Long id) {
        return operatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator not found: " + id));
    }

    public Operator create(Operator operator) {
        Operator saved = operatorRepository.save(operator);
        redisTemplate.opsForValue().set(STATUS_KEY_PREFIX + saved.getId(), saved.getStatus().name());
        return saved;
    }

    public Operator updateStatus(Long id, OperatorStatus newStatus) {
        Operator operator = getById(id);
        operator.setStatus(newStatus);
        Operator saved = operatorRepository.save(operator);
        redisTemplate.opsForValue().set(STATUS_KEY_PREFIX + saved.getId(), saved.getStatus().name());
        return saved;
    }

    public String getCachedStatus(Long id) {
        String cached = redisTemplate.opsForValue().get(STATUS_KEY_PREFIX + id);
        if (cached != null) {
            return cached;
        }
        return getById(id).getStatus().name();
    }
}